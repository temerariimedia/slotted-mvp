import React, { useState, useCallback } from 'react'
import { z } from 'zod'
import { modernAIOrchestrator, type CompanyDNA, type AIConfig } from '@/services/ai/modern-ai-orchestrator'
import { modernMCPEngine } from '@/services/mcp/modern-mcp-server'

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
        error.errors.forEach(err => {
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
    setExtractionState(prev => ({
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
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-6">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-2">
            Company DNA Extractor
          </h1>
          <p className="text-xl text-gray-600">
            Get your complete brand profile in 30 minutes
          </p>
        </div>

        {!showResult ? (
          <div className="bg-white rounded-2xl shadow-xl p-8">
            {/* AI Configuration */}
            <div className="mb-8">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">
                AI Configuration
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    AI Provider
                  </label>
                  <select
                    value={aiConfig.provider}
                    onChange={(e) => setAIConfig(prev => ({ ...prev, provider: e.target.value as AIConfig['provider'] }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    <option value="anthropic">Anthropic Claude</option>
                    <option value="openai">OpenAI GPT</option>
                    <option value="google">Google Gemini</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Model
                  </label>
                  <select
                    value={aiConfig.model}
                    onChange={(e) => setAIConfig(prev => ({ ...prev, model: e.target.value as AIConfig['model'] }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
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
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    API Key
                  </label>
                  <input
                    type="password"
                    value={aiConfig.apiKey}
                    onChange={(e) => setAIConfig(prev => ({ ...prev, apiKey: e.target.value }))}
                    placeholder="Enter API key"
                    className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                      validationErrors.apiKey ? 'border-red-500' : 'border-gray-300'
                    }`}
                  />
                  {validationErrors.apiKey && (
                    <p className="text-red-500 text-sm mt-1">{validationErrors.apiKey}</p>
                  )}
                </div>
              </div>
            </div>

            {/* Company Information Form */}
            <div className="space-y-6">
              <h3 className="text-lg font-semibold text-gray-900">
                Company Information
              </h3>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Company Name *
                </label>
                <input
                  type="text"
                  value={input.companyName}
                  onChange={(e) => setInput(prev => ({ ...prev, companyName: e.target.value }))}
                  placeholder="Enter company name"
                  className={`w-full px-4 py-3 border rounded-lg text-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                    validationErrors.companyName ? 'border-red-500' : 'border-gray-300'
                  }`}
                />
                {validationErrors.companyName && (
                  <p className="text-red-500 text-sm mt-1">{validationErrors.companyName}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Website URL
                </label>
                <input
                  type="url"
                  value={input.website}
                  onChange={(e) => setInput(prev => ({ ...prev, website: e.target.value }))}
                  placeholder="https://company.com"
                  className={`w-full px-4 py-3 border rounded-lg text-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                    validationErrors.website ? 'border-red-500' : 'border-gray-300'
                  }`}
                />
                {validationErrors.website && (
                  <p className="text-red-500 text-sm mt-1">{validationErrors.website}</p>
                )}
                <p className="text-gray-500 text-sm mt-1">
                  Optional: Provide website for automated brand analysis
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Industry
                  </label>
                  <input
                    type="text"
                    value={input.industry}
                    onChange={(e) => setInput(prev => ({ ...prev, industry: e.target.value }))}
                    placeholder="e.g., SaaS, E-commerce, Healthcare"
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg text-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Company Description
                  </label>
                  <textarea
                    value={input.description}
                    onChange={(e) => setInput(prev => ({ ...prev, description: e.target.value }))}
                    placeholder="Brief description of what your company does"
                    rows={3}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg text-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
              </div>
            </div>

            {/* Progress Display */}
            {extractionState.status === 'analyzing' && (
              <div className="mt-8 p-6 bg-blue-50 rounded-lg">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium text-blue-700">
                    {extractionState.currentStep}
                  </span>
                  <span className="text-sm text-blue-600">
                    {extractionState.progress}%
                  </span>
                </div>
                <div className="w-full bg-blue-200 rounded-full h-2">
                  <div 
                    className="bg-blue-600 h-2 rounded-full transition-all duration-500"
                    style={{ width: `${extractionState.progress}%` }}
                  />
                </div>
              </div>
            )}

            {/* Error Display */}
            {extractionState.status === 'error' && (
              <div className="mt-8 p-4 bg-red-50 border border-red-200 rounded-lg">
                <div className="flex items-center">
                  <div className="text-red-400 mr-3">
                    <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                    </svg>
                  </div>
                  <div>
                    <h3 className="text-sm font-medium text-red-800">
                      Analysis Failed
                    </h3>
                    <p className="text-sm text-red-700 mt-1">
                      {extractionState.error}
                    </p>
                  </div>
                </div>
              </div>
            )}

            {/* Action Buttons */}
            <div className="flex justify-between mt-8">
              <button
                onClick={resetForm}
                className="px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
              >
                Reset Form
              </button>
              
              <button
                onClick={extractCompanyDNA}
                disabled={extractionState.status === 'analyzing'}
                className="px-8 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                {extractionState.status === 'analyzing' ? 'Analyzing...' : 'Extract Company DNA'}
              </button>
            </div>
          </div>
        ) : (
          /* Results Display */
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
  onStartOver 
}) => {
  return (
    <div className="bg-white rounded-2xl shadow-xl p-8">
      <div className="text-center mb-8">
        <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
          </svg>
        </div>
        <h2 className="text-3xl font-bold text-gray-900 mb-2">
          Analysis Complete!
        </h2>
        <p className="text-gray-600">
          Your company DNA has been successfully extracted
        </p>
      </div>

      {/* Company Overview */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
        <div className="space-y-6">
          <div>
            <h3 className="text-lg font-semibold text-gray-900 mb-3">
              Company Profile
            </h3>
            <div className="bg-gray-50 rounded-lg p-4 space-y-2">
              <p><span className="font-medium">Name:</span> {result.company.name}</p>
              <p><span className="font-medium">Industry:</span> {result.company.industry}</p>
              <p><span className="font-medium">Size:</span> {result.company.size}</p>
              {result.company.website && (
                <p><span className="font-medium">Website:</span> {result.company.website}</p>
              )}
            </div>
          </div>

          <div>
            <h3 className="text-lg font-semibold text-gray-900 mb-3">
              Brand Voice
            </h3>
            <div className="bg-gray-50 rounded-lg p-4 space-y-2">
              <p><span className="font-medium">Personality:</span> {result.brandDNA.brandVoice.personality.join(', ')}</p>
              <p><span className="font-medium">Tone:</span> {result.brandDNA.brandVoice.tone}</p>
              <p><span className="font-medium">Style:</span> {result.brandDNA.brandVoice.communicationStyle}</p>
            </div>
          </div>
        </div>

        <div className="space-y-6">
          <div>
            <h3 className="text-lg font-semibold text-gray-900 mb-3">
              Value Propositions
            </h3>
            <div className="bg-gray-50 rounded-lg p-4">
              <ul className="space-y-1">
                {result.brandDNA.valuePropositions.map((value, index) => (
                  <li key={index} className="flex items-start">
                    <span className="text-blue-500 mr-2">•</span>
                    {value}
                  </li>
                ))}
              </ul>
            </div>
          </div>

          <div>
            <h3 className="text-lg font-semibold text-gray-900 mb-3">
              Marketing Insights
            </h3>
            <div className="bg-gray-50 rounded-lg p-4 space-y-2">
              <p><span className="font-medium">Competitive Advantage:</span> {result.marketingInsights.competitiveAdvantage}</p>
              <p><span className="font-medium">Recommended Channels:</span> {result.marketingInsights.recommendedChannels.join(', ')}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Analysis Metadata */}
      <div className="bg-blue-50 rounded-lg p-4 mb-8">
        <h3 className="text-sm font-semibold text-blue-800 mb-2">Analysis Details</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm text-blue-700">
          <p>Confidence Score: {Math.round(result.metadata.confidenceScore * 100)}%</p>
          <p>Website Analyzed: {result.metadata.websiteAnalyzed ? 'Yes' : 'No'}</p>
          <p>Extracted: {new Date(result.metadata.extractedAt).toLocaleDateString()}</p>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex justify-between">
        <button
          onClick={onStartOver}
          className="px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
        >
          Analyze Another Company
        </button>
        
        <button
          onClick={onDownload}
          className="px-8 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
        >
          Download JSON
        </button>
      </div>
    </div>
  )
}