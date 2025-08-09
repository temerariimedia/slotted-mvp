import type React from 'react'
import { useEffect, useState } from 'react'
import { CompanyDNAExtractor } from './components/mvp1/CompanyDNAExtractor'
import { MarketingCalendarGenerator } from './components/mvp2/MarketingCalendarGenerator'
import type { CompanyDNA } from './services/ai/modern-ai-orchestrator'
import type { MarketingCalendar } from './services/campaigns/campaign-generator'
import { modernMCPEngine } from './services/mcp/modern-mcp-server'

// App state interface
interface AppState {
  currentView: 'landing' | 'mvp1' | 'mvp2' | 'mvp3' | 'mvp4' | 'mvp5'
  companyDNA: CompanyDNA | null
  marketingCalendar: MarketingCalendar | null
  userEmail: string
  isLoading: boolean
}

export const App: React.FC = () => {
  const [appState, setAppState] = useState<AppState>({
    currentView: 'landing',
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
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading Slotted...</p>
        </div>
      </div>
    )
  }

  // Render different views based on current state
  switch (appState.currentView) {
    case 'mvp1':
      return <CompanyDNAExtractor />

    case 'mvp2':
      return (
        <div className="min-h-screen bg-gray-50">
          <div className="bg-white shadow-sm mb-6">
            <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
              <button
                onClick={() => setAppState((prev) => ({ ...prev, currentView: 'landing' }))}
                className="flex items-center text-blue-600 hover:text-blue-700"
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
                <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
                  <span className="text-white font-bold text-sm">S</span>
                </div>
                <span className="text-xl font-bold text-gray-900">Slotted</span>
              </div>
            </div>
          </div>

          <MarketingCalendarGenerator
            companyDNA={appState.companyDNA || undefined}
            userEmail={appState.userEmail}
            onCalendarGenerated={(calendar) => {
              setAppState((prev) => ({ ...prev, marketingCalendar: calendar }))
            }}
          />
        </div>
      )

    case 'mvp3':
      return (
        <div className="min-h-screen bg-gray-50 flex items-center justify-center">
          <div className="text-center">
            <h1 className="text-2xl font-bold text-gray-900 mb-4">MVP #3: Blog Content Engine</h1>
            <p className="text-gray-600 mb-8">Coming soon...</p>
            <button
              onClick={() => setAppState((prev) => ({ ...prev, currentView: 'landing' }))}
              className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
            >
              Back to Home
            </button>
          </div>
        </div>
      )

    case 'mvp4':
      return (
        <div className="min-h-screen bg-gray-50 flex items-center justify-center">
          <div className="text-center">
            <h1 className="text-2xl font-bold text-gray-900 mb-4">
              MVP #4: Multi-Channel Asset Creator
            </h1>
            <p className="text-gray-600 mb-8">Coming soon...</p>
            <button
              onClick={() => setAppState((prev) => ({ ...prev, currentView: 'landing' }))}
              className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
            >
              Back to Home
            </button>
          </div>
        </div>
      )

    case 'mvp5':
      return (
        <div className="min-h-screen bg-gray-50 flex items-center justify-center">
          <div className="text-center">
            <h1 className="text-2xl font-bold text-gray-900 mb-4">MVP #5: Campaign Orchestrator</h1>
            <p className="text-gray-600 mb-8">Coming soon...</p>
            <button
              onClick={() => setAppState((prev) => ({ ...prev, currentView: 'landing' }))}
              className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
            >
              Back to Home
            </button>
          </div>
        </div>
      )

    default:
      return <LandingPage appState={appState} setAppState={setAppState} />
  }
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
      features: [
        'Multi-platform graphics',
        'Social media adaptations',
        'Email campaigns',
        'Video scripts',
        'Automated organization',
      ],
    },
    {
      id: 'mvp5',
      title: 'Campaign Orchestrator',
      description: 'Complete omnichannel campaigns on autopilot',
      price: '$499-999/mo',
      status: 'coming-soon',
      features: [
        'Full workflow automation',
        'Campaign performance tracking',
        'Asset management',
        'Multi-agent coordination',
        'Analytics dashboard',
      ],
    },
  ]

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50">
      {/* Header */}
      <header className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-sm">S</span>
              </div>
              <span className="text-xl font-bold text-gray-900">Slotted</span>
            </div>

            {appState.companyDNA && (
              <div className="flex items-center space-x-2 text-sm text-gray-600">
                <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                <span>Company DNA: {appState.companyDNA.company.name}</span>
              </div>
            )}
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="py-20 px-6">
        <div className="max-w-4xl mx-auto text-center">
          <h1 className="text-5xl font-bold text-gray-900 mb-6">
            AI-Powered Marketing, <span className="text-blue-600">One MVP at a Time</span>
          </h1>
          <p className="text-xl text-gray-600 mb-8 max-w-2xl mx-auto">
            Ship value incrementally with 5 standalone micro MVPs. Each tool provides immediate
            value and can be used independently or combined for maximum impact.
          </p>

          {!appState.companyDNA && (
            <button
              onClick={() => setAppState((prev) => ({ ...prev, currentView: 'mvp1' }))}
              className="px-8 py-4 bg-blue-600 text-white text-lg font-semibold rounded-xl hover:bg-blue-700 transition-colors shadow-lg"
            >
              Start with Company DNA Extractor
            </button>
          )}
        </div>
      </section>

      {/* MVP Cards */}
      <section className="py-16 px-6">
        <div className="max-w-7xl mx-auto">
          <h2 className="text-3xl font-bold text-center text-gray-900 mb-12">
            Choose Your Starting Point
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {mvpFeatures.map((mvp, index) => (
              <div
                key={mvp.id}
                className={`bg-white rounded-2xl shadow-lg p-6 border-2 transition-all duration-200 ${
                  mvp.status === 'available'
                    ? 'border-transparent hover:border-blue-200 hover:shadow-xl cursor-pointer'
                    : 'border-gray-100 opacity-75'
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
                <div className="flex items-center justify-between mb-4">
                  <span className="text-sm font-semibold text-blue-600">MVP #{index + 1}</span>
                  {mvp.status === 'available' ? (
                    <span className="px-2 py-1 bg-green-100 text-green-700 text-xs font-medium rounded-full">
                      Available
                    </span>
                  ) : (
                    <span className="px-2 py-1 bg-gray-100 text-gray-600 text-xs font-medium rounded-full">
                      Coming Soon
                    </span>
                  )}
                </div>

                <h3 className="text-xl font-bold text-gray-900 mb-2">{mvp.title}</h3>

                <p className="text-gray-600 mb-4">{mvp.description}</p>

                <div className="text-2xl font-bold text-blue-600 mb-4">{mvp.price}</div>

                <ul className="space-y-2">
                  {mvp.features.map((feature, featureIndex) => (
                    <li key={featureIndex} className="flex items-start text-sm text-gray-600">
                      <svg
                        className="w-4 h-4 text-green-500 mt-0.5 mr-2 flex-shrink-0"
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
                  <button className="w-full mt-6 px-4 py-2 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 transition-colors">
                    Try Now
                  </button>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Value Proposition */}
      <section className="py-16 px-6 bg-white">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-3xl font-bold text-gray-900 mb-8">Why Build One MVP at a Time?</h2>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="text-center">
              <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg
                  className="w-8 h-8 text-blue-600"
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
              <h3 className="text-xl font-semibold text-gray-900 mb-2">Immediate Value</h3>
              <p className="text-gray-600">
                Each MVP provides standalone value you can use immediately, without waiting for the
                complete system.
              </p>
            </div>

            <div className="text-center">
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg
                  className="w-8 h-8 text-green-600"
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
              <h3 className="text-xl font-semibold text-gray-900 mb-2">Revenue Validation</h3>
              <p className="text-gray-600">
                Generate revenue from early MVPs to fund development of more advanced features.
              </p>
            </div>

            <div className="text-center">
              <div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg
                  className="w-8 h-8 text-purple-600"
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
              <h3 className="text-xl font-semibold text-gray-900 mb-2">Iterative Learning</h3>
              <p className="text-gray-600">
                Learn from user feedback on each MVP to improve the next iteration and overall
                platform.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-12 px-6">
        <div className="max-w-4xl mx-auto text-center">
          <h3 className="text-2xl font-bold mb-4">Ready to Transform Your Marketing?</h3>
          <p className="text-gray-300 mb-8">
            Start with one MVP and scale as you see results. Each tool is designed to provide
            immediate value.
          </p>

          {!appState.companyDNA && (
            <button
              onClick={() => setAppState((prev) => ({ ...prev, currentView: 'mvp1' }))}
              className="px-8 py-4 bg-blue-600 text-white font-semibold rounded-xl hover:bg-blue-700 transition-colors"
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
