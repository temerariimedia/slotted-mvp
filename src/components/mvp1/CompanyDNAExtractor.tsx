import {
  type AIConfig,
  type CompanyDNA,
  modernAIOrchestrator,
} from '@/services/ai/modern-ai-orchestrator'
import { modernMCPEngine } from '@/services/mcp/modern-mcp-server'
import type React from 'react'
import { useCallback, useState } from 'react'
import { z } from 'zod'

// Input validation schema
const CompanyInputSchema = z.object({
  companyName: z.string().min(1, 'Company name is required'),
  website: z.string().url('Please enter a valid URL').optional().or(z.literal('')),
  industry: z.string().optional(),
  description: z.string().optional(),
})

type CompanyInput = z.infer<typeof CompanyInputSchema>

// Component state interface
interface ExtractionState {
  status: 'idle' | 'analyzing' | 'completed' | 'error'
  progress: number
  currentStep: string
  error?: string
  result?: CompanyDNA
}

export const CompanyDNAExtractor: React.FC = () => {
  const [input, setInput] = useState<CompanyInput>({
    companyName: '',
    website: '',
    industry: '',
    description: '',
  })

  const [extractionState, setExtractionState] = useState<ExtractionState>({
    status: 'idle',
    progress: 0,
    currentStep: '',
  })

  const [aiConfig, setAIConfig] = useState<AIConfig>({
    provider: 'anthropic',
    model: 'claude-3-5-sonnet-20241022',
    apiKey: '',
    temperature: 0.7,
    maxTokens: 4000,
  })

  const [showResult, setShowResult] = useState(false)
  const [validationErrors, setValidationErrors] = useState<Record<string, string>>({})

  /**
   * Validate input form
   */
  const validateInput = useCallback((data: CompanyInput) => {
    try {
      CompanyInputSchema.parse(data)
      setValidationErrors({})
      return true
    } catch (error) {
      if (error instanceof z.ZodError) {
        const errors: Record<string, string> = {}
        error.errors.forEach((err) => {
          if (err.path.length > 0) {
            errors[err.path[0] as string] = err.message
          }
        })
        setValidationErrors(errors)
      }
      return false
    }
  }, [])

  /**
   * Update progress and step
   */
  const updateProgress = useCallback((progress: number, step: string) => {
    setExtractionState((prev) => ({
      ...prev,
      progress,
      currentStep: step,
    }))
  }, [])

  /**
   * Main extraction function
   */
  const extractCompanyDNA = useCallback(async () => {
    if (!validateInput(input)) {
      return
    }

    if (!aiConfig.apiKey) {
      setValidationErrors({ apiKey: 'API key is required' })
      return
    }

    try {
      setExtractionState({
        status: 'analyzing',
        progress: 0,
        currentStep: 'Initializing analysis...',
      })

      // Configure AI provider
      updateProgress(10, 'Configuring AI provider...')
      modernAIOrchestrator.configureProvider(aiConfig)

      // Enhanced progress tracking for website analysis
      if (input.website) {
        updateProgress(15, 'Initializing advanced website analyzer...')
        updateProgress(25, 'Loading website content...')
        updateProgress(35, 'Extracting brand elements...')
        updateProgress(45, 'Analyzing visual design...')
      } else {
        updateProgress(30, 'Processing company information...')
      }

      // Extract company DNA with enhanced analysis
      updateProgress(60, 'Generating comprehensive brand analysis...')
      const companyDNA = await modernAIOrchestrator.extractCompanyDNA({
        companyName: input.companyName,
        website: input.website || undefined,
        industry: input.industry || undefined,
        description: input.description || undefined,
      })

      updateProgress(85, 'Saving to MCP context...')
      await modernMCPEngine.saveContext(companyDNA)

      updateProgress(100, 'Analysis complete!')

      setExtractionState({
        status: 'completed',
        progress: 100,
        currentStep: 'Analysis completed successfully',
        result: companyDNA,
      })

      setShowResult(true)
    } catch (error) {
      console.error('❌ Company DNA extraction failed:', error)
      setExtractionState({
        status: 'error',
        progress: 0,
        currentStep: '',
        error: error instanceof Error ? error.message : 'Unknown error occurred',
      })
    } finally {
      // Cleanup is handled automatically by the enhanced analyzer
      console.log('🎉 Company DNA extraction process completed')
    }
  }, [input, aiConfig, validateInput, updateProgress])

  /**
   * Download result as JSON
   */
  const downloadResult = useCallback(() => {
    if (!extractionState.result) return

    const jsonString = modernAIOrchestrator.exportCompanyDNA(extractionState.result)
    const blob = new Blob([jsonString], { type: 'application/json' })
    const url = URL.createObjectURL(blob)

    const a = document.createElement('a')
    a.href = url
    a.download = `${input.companyName.toLowerCase().replace(/[^a-z0-9]/g, '-')}-dna.json`
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
  }, [extractionState.result, input.companyName])

  /**
   * Reset form
   */
  const resetForm = useCallback(() => {
    setInput({
      companyName: '',
      website: '',
      industry: '',
      description: '',
    })
    setExtractionState({
      status: 'idle',
      progress: 0,
      currentStep: '',
    })
    setShowResult(false)
    setValidationErrors({})
  }, [])

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 p-4 sm:p-6 lg:p-8">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8 sm:mb-12">
          <div className="w-20 h-20 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-lg">
            <span className="text-3xl">🧬</span>
          </div>
          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-gray-900 mb-4 leading-tight">
            Company DNA Extractor
          </h1>
          <p className="text-lg sm:text-xl text-gray-600 max-w-2xl mx-auto leading-relaxed">
            Get your complete brand profile in 30 minutes with AI-powered analysis
          </p>
        </div>

        {!showResult ? (
          <div className="bg-white/80 backdrop-blur-sm rounded-3xl shadow-2xl p-6 sm:p-8 lg:p-10 border border-white/20">
            {/* AI Configuration */}
            <div className="mb-8 lg:mb-10">
              <h3 className="text-xl font-semibold text-gray-900 mb-6 flex items-center">
                <svg className="w-6 h-6 text-blue-600 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                </svg>
                AI Configuration
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 lg:gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    AI Provider
                  </label>
                  <select
                    value={aiConfig.provider}
                    onChange={(e) =>
                      setAIConfig((prev) => ({
                        ...prev,
                        provider: e.target.value as AIConfig['provider'],
                      }))
                    }
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 bg-white/50 backdrop-blur-sm"
                  >
                    <option value="anthropic">Anthropic Claude</option>
                    <option value="openai">OpenAI GPT</option>
                    <option value="google">Google Gemini</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Model</label>
                  <select
                    value={aiConfig.model}
                    onChange={(e) =>
                      setAIConfig((prev) => ({
                        ...prev,
                        model: e.target.value as AIConfig['model'],
                      }))
                    }
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 bg-white/50 backdrop-blur-sm"
                  >
                    {aiConfig.provider === 'anthropic' && (
                      <>
                        <option value="claude-3-5-sonnet-20241022">Claude 3.5 Sonnet</option>
                        <option value="claude-3-5-haiku-20241022">Claude 3.5 Haiku</option>
                      </>
                    )}
                    {aiConfig.provider === 'openai' && (
                      <>
                        <option value="gpt-4o">GPT-4o</option>
                        <option value="gpt-4-turbo-2024-04-09">GPT-4 Turbo</option>
                      </>
                    )}
                    {aiConfig.provider === 'google' && (
                      <>
                        <option value="gemini-2.0-flash">Gemini 2.0 Flash</option>
                        <option value="gemini-1.5-pro">Gemini 1.5 Pro</option>
                      </>
                    )}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">API Key</label>
                  <input
                    type="password"
                    value={aiConfig.apiKey}
                    onChange={(e) => setAIConfig((prev) => ({ ...prev, apiKey: e.target.value }))}
                    placeholder="Enter API key"
                    className={`w-full px-4 py-3 border rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 bg-white/50 backdrop-blur-sm ${
                      validationErrors.apiKey ? 'border-red-500' : 'border-gray-300'
                    }`}
                  />
                  {validationErrors.apiKey && (
                    <p className="text-red-500 text-sm mt-2">{validationErrors.apiKey}</p>
                  )}
                </div>
              </div>
            </div>

            {/* Company Information Form */}
            <div className="space-y-6 lg:space-y-8">
              <h3 className="text-xl font-semibold text-gray-900 flex items-center">
                <svg className="w-6 h-6 text-green-600 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                </svg>
                Company Information
              </h3>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Company Name *
                </label>
                <input
                  type="text"
                  value={input.companyName}
                  onChange={(e) => setInput((prev) => ({ ...prev, companyName: e.target.value }))}
                  placeholder="Enter company name"
                  className={`w-full px-4 py-3 border rounded-xl text-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 bg-white/50 backdrop-blur-sm ${
                    validationErrors.companyName ? 'border-red-500' : 'border-gray-300'
                  }`}
                />
                {validationErrors.companyName && (
                  <p className="text-red-500 text-sm mt-2">{validationErrors.companyName}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Website URL</label>
                <input
                  type="url"
                  value={input.website}
                  onChange={(e) => setInput((prev) => ({ ...prev, website: e.target.value }))}
                  placeholder="https://company.com"
                  className={`w-full px-4 py-3 border rounded-xl text-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 bg-white/50 backdrop-blur-sm ${
                    validationErrors.website ? 'border-red-500' : 'border-gray-300'
                  }`}
                />
                {validationErrors.website && (
                  <p className="text-red-500 text-sm mt-2">{validationErrors.website}</p>
                )}
                <p className="text-gray-500 text-sm mt-2 flex items-center">
                  <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  Optional: Provide website for automated brand analysis
                </p>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Industry</label>
                  <input
                    type="text"
                    value={input.industry}
                    onChange={(e) => setInput((prev) => ({ ...prev, industry: e.target.value }))}
                    placeholder="e.g., SaaS, E-commerce, Healthcare"
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl text-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 bg-white/50 backdrop-blur-sm"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Company Description
                  </label>
                  <textarea
                    value={input.description}
                    onChange={(e) => setInput((prev) => ({ ...prev, description: e.target.value }))}
                    placeholder="Brief description of what your company does"
                    rows={3}
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl text-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 bg-white/50 backdrop-blur-sm resize-none"
                  />
                </div>
              </div>
            </div>

            {/* Progress Display */}
            {extractionState.status === 'analyzing' && (
              <div className="mt-8 lg:mt-10 p-6 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-2xl border border-blue-200">
                <div className="flex items-center justify-between mb-4">
                  <span className="text-sm font-medium text-blue-700 flex items-center">
                    <div className="animate-spin rounded-full h-4 w-4 border-2 border-blue-600 border-t-transparent mr-2"></div>
                    {extractionState.currentStep}
                  </span>
                  <span className="text-sm font-semibold text-blue-600 bg-blue-100 px-3 py-1 rounded-full">
                    {extractionState.progress}%
                  </span>
                </div>
                <div className="w-full bg-blue-200 rounded-full h-3 overflow-hidden">
                  <div
                    className="bg-gradient-to-r from-blue-500 to-indigo-600 h-3 rounded-full transition-all duration-500 ease-out"
                    style={{ width: `${extractionState.progress}%` }}
                  />
                </div>
              </div>
            )}

            {/* Error Display */}
            {extractionState.status === 'error' && (
              <div className="mt-8 lg:mt-10 p-6 bg-gradient-to-r from-red-50 to-pink-50 border border-red-200 rounded-2xl">
                <div className="flex items-start">
                  <div className="text-red-400 mr-4 mt-1">
                    <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 20 20">
                      <path
                        fillRule="evenodd"
                        d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z"
                        clipRule="evenodd"
                      />
                    </svg>
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-red-800 mb-2">Analysis Failed</h3>
                    <p className="text-red-700 leading-relaxed">{extractionState.error}</p>
                  </div>
                </div>
              </div>
            )}

            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row justify-between gap-4 mt-8 lg:mt-10">
              <button
                onClick={resetForm}
                className="px-6 py-3 border-2 border-gray-300 text-gray-700 rounded-xl hover:bg-gray-50 hover:border-gray-400 transition-all duration-200 font-medium"
              >
                Reset Form
              </button>

              <button
                onClick={extractCompanyDNA}
                disabled={extractionState.status === 'analyzing'}
                className="px-8 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-xl hover:from-blue-700 hover:to-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 font-semibold"
              >
                {extractionState.status === 'analyzing' ? (
                  <span className="flex items-center">
                    <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent mr-2"></div>
                    Analyzing...
                  </span>
                ) : (
                  'Extract Company DNA'
                )}
              </button>
            </div>
          </div>
        ) : (
          <CompanyDNAResults
            result={extractionState.result!}
            onDownload={downloadResult}
            onStartOver={resetForm}
          />
        )}
      </div>
    </div>
  )
}

// Results component
interface CompanyDNAResultsProps {
  result: CompanyDNA
  onDownload: () => void
  onStartOver: () => void
}

const CompanyDNAResults: React.FC<CompanyDNAResultsProps> = ({
  result,
  onDownload,
  onStartOver,
}) => {
  return (
    <div className="bg-white/80 backdrop-blur-sm rounded-3xl shadow-2xl p-6 sm:p-8 lg:p-10 border border-white/20">
      <div className="text-center mb-8 lg:mb-12">
        <div className="w-20 h-20 bg-gradient-to-br from-green-500 to-emerald-600 rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-lg">
          <svg
            className="w-10 h-10 text-white"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
          </svg>
        </div>
        <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-4 leading-tight">Analysis Complete!</h2>
        <p className="text-lg text-gray-600 max-w-2xl mx-auto leading-relaxed">
          Your company DNA has been successfully extracted and is ready for use
        </p>
      </div>

      {/* Company Overview */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 lg:gap-8 mb-8 lg:mb-10">
        <div className="space-y-6">
          <div>
            <h3 className="text-xl font-semibold text-gray-900 mb-4 flex items-center">
              <svg className="w-6 h-6 text-blue-600 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
              </svg>
              Company Profile
            </h3>
            <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-2xl p-6 border border-blue-200 space-y-3">
              <div className="flex items-center">
                <span className="font-semibold text-gray-700 w-24">Name:</span>
                <span className="text-gray-900">{result.company.name}</span>
              </div>
              <div className="flex items-center">
                <span className="font-semibold text-gray-700 w-24">Industry:</span>
                <span className="text-gray-900">{result.company.industry}</span>
              </div>
              <div className="flex items-center">
                <span className="font-semibold text-gray-700 w-24">Size:</span>
                <span className="text-gray-900">{result.company.size}</span>
              </div>
              {result.company.website && (
                <div className="flex items-center">
                  <span className="font-semibold text-gray-700 w-24">Website:</span>
                  <span className="text-blue-600 hover:text-blue-700 transition-colors">{result.company.website}</span>
                </div>
              )}
            </div>
          </div>

          <div>
            <h3 className="text-xl font-semibold text-gray-900 mb-4 flex items-center">
              <svg className="w-6 h-6 text-purple-600 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 8h10M7 12h4m1 8l-4-4H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-3l-4 4z" />
              </svg>
              Brand Voice
            </h3>
            <div className="bg-gradient-to-br from-purple-50 to-pink-50 rounded-2xl p-6 border border-purple-200 space-y-3">
              <div>
                <span className="font-semibold text-gray-700">Personality:</span>
                <div className="flex flex-wrap gap-2 mt-1">
                  {result.brandDNA.brandVoice.personality.map((trait, index) => (
                    <span key={index} className="px-3 py-1 bg-purple-100 text-purple-700 rounded-full text-sm font-medium">
                      {trait}
                    </span>
                  ))}
                </div>
              </div>
              <div className="flex items-center">
                <span className="font-semibold text-gray-700 w-24">Tone:</span>
                <span className="text-gray-900">{result.brandDNA.brandVoice.tone}</span>
              </div>
              <div className="flex items-center">
                <span className="font-semibold text-gray-700 w-24">Style:</span>
                <span className="text-gray-900">{result.brandDNA.brandVoice.communicationStyle}</span>
              </div>
            </div>
          </div>
        </div>

        <div className="space-y-6">
          <div>
            <h3 className="text-xl font-semibold text-gray-900 mb-4 flex items-center">
              <svg className="w-6 h-6 text-green-600 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              Value Propositions
            </h3>
            <div className="bg-gradient-to-br from-green-50 to-emerald-50 rounded-2xl p-6 border border-green-200">
              <ul className="space-y-3">
                {result.brandDNA.valuePropositions.map((value, index) => (
                  <li key={index} className="flex items-start">
                    <div className="w-2 h-2 bg-green-500 rounded-full mt-2 mr-3 flex-shrink-0"></div>
                    <span className="text-gray-800 leading-relaxed">{value}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>

          <div>
            <h3 className="text-xl font-semibold text-gray-900 mb-4 flex items-center">
              <svg className="w-6 h-6 text-orange-600 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
              </svg>
              Marketing Insights
            </h3>
            <div className="bg-gradient-to-br from-orange-50 to-amber-50 rounded-2xl p-6 border border-orange-200 space-y-3">
              <div>
                <span className="font-semibold text-gray-700">Competitive Advantage:</span>
                <p className="text-gray-800 mt-1 leading-relaxed">{result.marketingInsights.competitiveAdvantage}</p>
              </div>
              <div>
                <span className="font-semibold text-gray-700">Recommended Channels:</span>
                <div className="flex flex-wrap gap-2 mt-1">
                  {result.marketingInsights.recommendedChannels.map((channel, index) => (
                    <span key={index} className="px-3 py-1 bg-orange-100 text-orange-700 rounded-full text-sm font-medium">
                      {channel}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Analysis Metadata */}
      <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-2xl p-6 mb-8 lg:mb-10 border border-blue-200">
        <h3 className="text-lg font-semibold text-blue-800 mb-4 flex items-center">
          <svg className="w-6 h-6 text-blue-600 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
          </svg>
          Analysis Details
        </h3>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-sm">
          <div className="bg-white/50 rounded-xl p-4 text-center">
            <div className="text-2xl font-bold text-blue-600 mb-1">{Math.round(result.metadata.confidenceScore * 100)}%</div>
            <div className="text-blue-700 font-medium">Confidence Score</div>
          </div>
          <div className="bg-white/50 rounded-xl p-4 text-center">
            <div className="text-2xl font-bold text-blue-600 mb-1">{result.metadata.websiteAnalyzed ? '✓' : '✗'}</div>
            <div className="text-blue-700 font-medium">Website Analyzed</div>
          </div>
          <div className="bg-white/50 rounded-xl p-4 text-center">
            <div className="text-2xl font-bold text-blue-600 mb-1">{new Date(result.metadata.extractedAt).toLocaleDateString()}</div>
            <div className="text-blue-700 font-medium">Extracted Date</div>
          </div>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex flex-col sm:flex-row justify-between gap-4">
        <button
          onClick={onStartOver}
          className="px-8 py-3 border-2 border-gray-300 text-gray-700 rounded-xl hover:bg-gray-50 hover:border-gray-400 transition-all duration-200 font-semibold"
        >
          Analyze Another Company
        </button>

        <button
          onClick={onDownload}
          className="px-8 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-xl hover:from-blue-700 hover:to-indigo-700 transition-all duration-200 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 font-semibold"
        >
          Download JSON Report
        </button>
      </div>
    </div>
  )
}
