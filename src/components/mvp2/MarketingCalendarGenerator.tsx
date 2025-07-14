import React, { useState } from 'react'
import { campaignGenerator, type MarketingCalendar, type CampaignTopic } from '@/services/campaigns/campaign-generator'
import { modernAIOrchestrator, type CompanyDNA } from '@/services/ai/modern-ai-orchestrator'
import { paymentStateManager } from '@/services/payments/stripe-integration'

interface MarketingCalendarGeneratorProps {
  companyDNA?: CompanyDNA
  userEmail?: string
  onCalendarGenerated: (calendar: MarketingCalendar) => void
}

export const MarketingCalendarGenerator: React.FC<MarketingCalendarGeneratorProps> = ({
  companyDNA,
  userEmail,
  onCalendarGenerated
}) => {
  const [isGenerating, setIsGenerating] = useState(false)
  const [calendar, setCalendar] = useState<MarketingCalendar | null>(null)
  const [currentStep, setCurrentStep] = useState('')
  const [progress, setProgress] = useState(0)
  const [generationOptions, setGenerationOptions] = useState({
    weeks: 13,
    startDate: new Date().toISOString().split('T')[0],
    focusAreas: [] as string[],
    budget: ''
  })

  const handleGenerateCalendar = async () => {
    if (!companyDNA) {
      alert('Company DNA required. Please complete DNA extraction first.')
      return
    }

    if (userEmail && paymentStateManager.getRemainingAnalyses(userEmail) <= 0) {
      alert('No remaining analysis credits. Please purchase more.')
      return
    }

    setIsGenerating(true)
    setProgress(0)
    setCurrentStep('Initializing calendar generation...')

    try {
      // Initialize campaign generator with AI orchestrator
      const generator = new (await import('@/services/campaigns/campaign-generator')).AdvancedCampaignGenerator(modernAIOrchestrator)

      setCurrentStep('Generating strategic campaign topics...')
      setProgress(25)

      const generatedCalendar = await generator.generateMarketingCalendar({
        companyDNA,
        weeks: generationOptions.weeks,
        startDate: new Date(generationOptions.startDate),
        focusAreas: generationOptions.focusAreas.length > 0 ? generationOptions.focusAreas : undefined,
        budget: generationOptions.budget || undefined
      })

      setCurrentStep('Building content strategy...')
      setProgress(50)

      setCurrentStep('Creating channel distribution plan...')
      setProgress(75)

      setCurrentStep('Finalizing marketing calendar...')
      setProgress(100)

      setCalendar(generatedCalendar)
      onCalendarGenerated(generatedCalendar)

      // Use analysis credit if user is authenticated
      if (userEmail) {
        paymentStateManager.useAnalysisCredit(userEmail)
      }

      setCurrentStep('Calendar generation complete!')
    } catch (error) {
      console.error('Calendar generation failed:', error)
      alert('Calendar generation failed. Please try again.')
      setCurrentStep('Generation failed')
    } finally {
      setIsGenerating(false)
    }
  }

  const handleExportToGoogleSheets = () => {
    if (!calendar) return

    const generator = new (require('@/services/campaigns/campaign-generator')).AdvancedCampaignGenerator(null)
    const sheetsData = generator.exportToGoogleSheets(calendar)
    
    // Create downloadable CSV files for each sheet
    Object.entries(sheetsData).forEach(([sheetName, data]) => {
      const csv = (data as any[][]).map(row => row.join(',')).join('\n')
      const blob = new Blob([csv], { type: 'text/csv' })
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `${calendar.companyName}_${sheetName.replace(' ', '_')}.csv`
      document.body.appendChild(a)
      a.click()
      document.body.removeChild(a)
      URL.revokeObjectURL(url)
    })

    alert('Marketing calendar exported as CSV files!')
  }

  const handleFocusAreaToggle = (area: string) => {
    setGenerationOptions(prev => ({
      ...prev,
      focusAreas: prev.focusAreas.includes(area)
        ? prev.focusAreas.filter(a => a !== area)
        : [...prev.focusAreas, area]
    }))
  }

  const focusAreaOptions = [
    'Brand Awareness',
    'Lead Generation',
    'Customer Retention',
    'Product Launch',
    'Thought Leadership',
    'Community Building',
    'SEO & Content Marketing',
    'Social Media Growth'
  ]

  return (
    <div className="max-w-6xl mx-auto p-6">
      <div className="bg-white rounded-lg shadow-lg p-8">
        <div className="text-center mb-8">
          <h2 className="text-3xl font-bold text-gray-900 mb-4">
            🗓️ Marketing Calendar Generator
          </h2>
          <p className="text-xl text-gray-600">
            Generate a comprehensive 13-week marketing strategy based on your company DNA
          </p>
        </div>

        {/* Company DNA Preview */}
        {companyDNA && (
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-6 mb-8">
            <h3 className="text-lg font-semibold text-blue-900 mb-3">
              📊 Using Company DNA for: {companyDNA.company.name}
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
              <div>
                <span className="font-medium text-blue-800">Industry:</span>
                <span className="ml-2 text-blue-700">{companyDNA.company.industry}</span>
              </div>
              <div>
                <span className="font-medium text-blue-800">Target Audience:</span>
                <span className="ml-2 text-blue-700">{companyDNA.brandDNA.targetAudience.demographics}</span>
              </div>
              <div>
                <span className="font-medium text-blue-800">Market Position:</span>
                <span className="ml-2 text-blue-700">{companyDNA.marketingInsights.marketPosition}</span>
              </div>
            </div>
          </div>
        )}

        {/* Generation Options */}
        <div className="mb-8">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Generation Settings</h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Basic Options */}
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Calendar Duration (weeks)
                </label>
                <select
                  value={generationOptions.weeks}
                  onChange={(e) => setGenerationOptions(prev => ({ ...prev, weeks: parseInt(e.target.value) }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  disabled={isGenerating}
                >
                  <option value={13}>13 weeks (1 quarter)</option>
                  <option value={26}>26 weeks (2 quarters)</option>
                  <option value={52}>52 weeks (1 year)</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Start Date
                </label>
                <input
                  type="date"
                  value={generationOptions.startDate}
                  onChange={(e) => setGenerationOptions(prev => ({ ...prev, startDate: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  disabled={isGenerating}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Budget Range (optional)
                </label>
                <input
                  type="text"
                  value={generationOptions.budget}
                  onChange={(e) => setGenerationOptions(prev => ({ ...prev, budget: e.target.value }))}
                  placeholder="e.g., $5,000/month, $60,000/year"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  disabled={isGenerating}
                />
              </div>
            </div>

            {/* Focus Areas */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Focus Areas (select multiple)
              </label>
              <div className="grid grid-cols-2 gap-2">
                {focusAreaOptions.map(area => (
                  <label key={area} className="flex items-center space-x-2">
                    <input
                      type="checkbox"
                      checked={generationOptions.focusAreas.includes(area)}
                      onChange={() => handleFocusAreaToggle(area)}
                      disabled={isGenerating}
                      className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                    />
                    <span className="text-sm text-gray-700">{area}</span>
                  </label>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Generation Progress */}
        {isGenerating && (
          <div className="mb-8">
            <div className="bg-gray-50 border border-gray-200 rounded-lg p-6">
              <div className="flex items-center justify-between mb-3">
                <span className="text-sm font-medium text-gray-700">{currentStep}</span>
                <span className="text-sm text-gray-500">{progress}%</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div 
                  className="bg-blue-600 h-2 rounded-full transition-all duration-300" 
                  style={{ width: `${progress}%` }}
                ></div>
              </div>
            </div>
          </div>
        )}

        {/* Generation Button */}
        <div className="text-center mb-8">
          <button
            onClick={handleGenerateCalendar}
            disabled={isGenerating || !companyDNA}
            className={`px-8 py-3 rounded-lg font-semibold text-white transition-colors ${
              isGenerating || !companyDNA
                ? 'bg-gray-400 cursor-not-allowed'
                : 'bg-blue-600 hover:bg-blue-700'
            }`}
          >
            {isGenerating ? (
              <div className="flex items-center space-x-2">
                <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                <span>Generating Calendar...</span>
              </div>
            ) : (
              `Generate ${generationOptions.weeks}-Week Marketing Calendar`
            )}
          </button>
        </div>

        {/* Generated Calendar Preview */}
        {calendar && (
          <div className="border-t pt-8">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-2xl font-bold text-gray-900">
                📅 {calendar.companyName} Marketing Calendar
              </h3>
              <button
                onClick={handleExportToGoogleSheets}
                className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
              >
                📊 Export to CSV
              </button>
            </div>

            {/* Calendar Summary */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
              <div className="bg-gray-50 p-4 rounded-lg">
                <h4 className="font-semibold text-gray-900 mb-2">Period</h4>
                <p className="text-sm text-gray-600">
                  {new Date(calendar.period.startDate).toLocaleDateString()} - 
                  {new Date(calendar.period.endDate).toLocaleDateString()}
                </p>
                <p className="text-sm text-gray-600">{calendar.period.weeks} weeks</p>
              </div>
              
              <div className="bg-gray-50 p-4 rounded-lg">
                <h4 className="font-semibold text-gray-900 mb-2">Strategy</h4>
                <p className="text-sm text-gray-600">{calendar.strategy.overallTheme}</p>
              </div>
              
              <div className="bg-gray-50 p-4 rounded-lg">
                <h4 className="font-semibold text-gray-900 mb-2">Campaigns</h4>
                <p className="text-sm text-gray-600">{calendar.campaigns.length} strategic campaigns</p>
              </div>
            </div>

            {/* Campaign Timeline */}
            <div className="space-y-4">
              <h4 className="text-lg font-semibold text-gray-900">Campaign Timeline</h4>
              <div className="grid gap-4">
                {calendar.campaigns.slice(0, 6).map((campaign: CampaignTopic) => (
                  <div key={campaign.week} className="border border-gray-200 rounded-lg p-4">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center space-x-3 mb-2">
                          <span className="bg-blue-100 text-blue-800 text-xs font-medium px-2 py-1 rounded">
                            Week {campaign.week}
                          </span>
                          <span className="bg-gray-100 text-gray-800 text-xs font-medium px-2 py-1 rounded">
                            {campaign.theme}
                          </span>
                          <span className="bg-green-100 text-green-800 text-xs font-medium px-2 py-1 rounded">
                            {campaign.businessGoal}
                          </span>
                        </div>
                        <h5 className="font-semibold text-gray-900 mb-1">{campaign.title}</h5>
                        <p className="text-sm text-gray-600 mb-2">{campaign.description}</p>
                        <div className="flex items-center space-x-4 text-sm text-gray-500">
                          <span>📢 {campaign.primaryChannel}</span>
                          <span>💪 Effort: {campaign.estimatedEffort}/10</span>
                          <span>🎯 {campaign.callToAction}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
                
                {calendar.campaigns.length > 6 && (
                  <div className="text-center py-4">
                    <span className="text-gray-500">
                      + {calendar.campaigns.length - 6} more campaigns in full calendar
                    </span>
                  </div>
                )}
              </div>
            </div>

            {/* Channel Strategy */}
            <div className="mt-8 pt-6 border-t">
              <h4 className="text-lg font-semibold text-gray-900 mb-4">Channel Distribution</h4>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <h5 className="font-medium text-gray-900 mb-2">Primary Channels</h5>
                  <div className="space-y-1">
                    {calendar.channelStrategy.primary.map(channel => (
                      <span key={channel} className="inline-block bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded mr-1">
                        {channel}
                      </span>
                    ))}
                  </div>
                </div>
                
                <div>
                  <h5 className="font-medium text-gray-900 mb-2">Secondary Channels</h5>
                  <div className="space-y-1">
                    {calendar.channelStrategy.secondary.map(channel => (
                      <span key={channel} className="inline-block bg-gray-100 text-gray-800 text-xs px-2 py-1 rounded mr-1">
                        {channel}
                      </span>
                    ))}
                  </div>
                </div>
                
                <div>
                  <h5 className="font-medium text-gray-900 mb-2">Experimental</h5>
                  <div className="space-y-1">
                    {calendar.channelStrategy.experimental.map(channel => (
                      <span key={channel} className="inline-block bg-yellow-100 text-yellow-800 text-xs px-2 py-1 rounded mr-1">
                        {channel}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}