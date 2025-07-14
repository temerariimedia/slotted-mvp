import React, { useState } from 'react'
import { BlogContentGenerator, type BlogPost, type BlogGenerationOptions } from '@/services/content/blog-content-generator'
import { modernAIOrchestrator, type CompanyDNA } from '@/services/ai/modern-ai-orchestrator'
import { type CampaignTopic } from '@/services/campaigns/campaign-generator'
import { paymentStateManager } from '@/services/payments/stripe-integration'

interface BlogContentGeneratorProps {
  companyDNA?: CompanyDNA
  campaignTopic?: CampaignTopic
  userEmail?: string
  onBlogGenerated: (blog: BlogPost) => void
}

export const BlogContentGeneratorComponent: React.FC<BlogContentGeneratorProps> = ({
  companyDNA,
  campaignTopic,
  userEmail,
  onBlogGenerated
}) => {
  const [isGenerating, setIsGenerating] = useState(false)
  const [generatedBlog, setGeneratedBlog] = useState<BlogPost | null>(null)
  const [currentStep, setCurrentStep] = useState('')
  const [progress, setProgress] = useState(0)
  const [generationOptions, setGenerationOptions] = useState<Partial<BlogGenerationOptions>>({
    topic: campaignTopic?.title || '',
    contentLength: 2000,
    tone: 'professional',
    includeImages: false,
    seoOptimization: true,
    callToActionType: 'contact',
    targetKeywords: campaignTopic?.keywords || [],
  })

  const handleGenerateBlog = async () => {
    if (!companyDNA) {
      alert('Company DNA required. Please complete DNA extraction first.')
      return
    }

    if (!generationOptions.topic?.trim()) {
      alert('Please enter a blog topic.')
      return
    }

    if (userEmail && paymentStateManager.getRemainingAnalyses(userEmail) <= 0) {
      alert('No remaining blog generation credits. Please purchase more.')
      return
    }

    setIsGenerating(true)
    setProgress(0)
    setCurrentStep('Initializing blog generation...')

    try {
      // Initialize blog generator with AI orchestrator
      const generator = new BlogContentGenerator(modernAIOrchestrator)

      setCurrentStep('Analyzing topic and keywords...')
      setProgress(20)

      const options: BlogGenerationOptions = {
        topic: generationOptions.topic!,
        companyDNA,
        campaignContext: campaignTopic,
        targetKeywords: generationOptions.targetKeywords,
        contentLength: generationOptions.contentLength || 2000,
        tone: generationOptions.tone || 'professional',
        includeImages: generationOptions.includeImages || false,
        seoOptimization: generationOptions.seoOptimization || true,
        callToActionType: generationOptions.callToActionType || 'contact',
        customCTA: generationOptions.customCTA,
      }

      setCurrentStep('Generating comprehensive blog content...')
      setProgress(50)

      const blog = await generator.generateBlogPost(options)

      setCurrentStep('Optimizing SEO and brand voice...')
      setProgress(80)

      setCurrentStep('Finalizing blog post...')
      setProgress(100)

      setGeneratedBlog(blog)
      onBlogGenerated(blog)

      // Use analysis credit if user is authenticated
      if (userEmail) {
        paymentStateManager.useAnalysisCredit(userEmail)
      }

      setCurrentStep('Blog generation complete!')
    } catch (error) {
      console.error('Blog generation failed:', error)
      alert('Blog generation failed. Please try again.')
      setCurrentStep('Generation failed')
    } finally {
      setIsGenerating(false)
    }
  }

  const handleExportBlog = async (format: 'markdown' | 'html' | 'json') => {
    if (!generatedBlog) return

    try {
      const generator = new BlogContentGenerator(null)
      const exportedContent = await generator.exportBlogPost(generatedBlog, format)
      
      const blob = new Blob([exportedContent], { 
        type: format === 'json' ? 'application/json' : 'text/plain' 
      })
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `${generatedBlog.title.replace(/[^a-zA-Z0-9]/g, '_')}.${format}`
      document.body.appendChild(a)
      a.click()
      document.body.removeChild(a)
      URL.revokeObjectURL(url)
    } catch (error) {
      console.error('Export failed:', error)
      alert('Export failed. Please try again.')
    }
  }

  const handleTopicChange = (topic: string) => {
    setGenerationOptions(prev => ({ ...prev, topic }))
  }

  const handleKeywordAdd = (keyword: string) => {
    if (keyword.trim() && !generationOptions.targetKeywords?.includes(keyword.trim())) {
      setGenerationOptions(prev => ({
        ...prev,
        targetKeywords: [...(prev.targetKeywords || []), keyword.trim()]
      }))
    }
  }

  const handleKeywordRemove = (keyword: string) => {
    setGenerationOptions(prev => ({
      ...prev,
      targetKeywords: prev.targetKeywords?.filter(k => k !== keyword) || []
    }))
  }

  return (
    <div className="max-w-6xl mx-auto p-6">
      <div className="bg-white rounded-lg shadow-lg p-8">
        <div className="text-center mb-8">
          <h2 className="text-3xl font-bold text-gray-900 mb-4">
            📝 Blog Content Generator
          </h2>
          <p className="text-xl text-gray-600">
            Create professional 2000+ word blog posts with perfect brand voice consistency
          </p>
        </div>

        {/* Company DNA Preview */}
        {companyDNA && (
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-6 mb-8">
            <h3 className="text-lg font-semibold text-blue-900 mb-3">
              🧬 Using Company DNA for: {companyDNA.company.name}
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
              <div>
                <span className="font-medium text-blue-800">Brand Voice:</span>
                <span className="ml-2 text-blue-700">{companyDNA.brandDNA.brandVoice.tone}</span>
              </div>
              <div>
                <span className="font-medium text-blue-800">Industry:</span>
                <span className="ml-2 text-blue-700">{companyDNA.company.industry}</span>
              </div>
              <div>
                <span className="font-medium text-blue-800">Target Audience:</span>
                <span className="ml-2 text-blue-700">{companyDNA.brandDNA.targetAudience.demographics}</span>
              </div>
            </div>
          </div>
        )}

        {/* Campaign Context */}
        {campaignTopic && (
          <div className="bg-green-50 border border-green-200 rounded-lg p-6 mb-8">
            <h3 className="text-lg font-semibold text-green-900 mb-3">
              📅 Campaign Context: {campaignTopic.title}
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
              <div>
                <span className="font-medium text-green-800">Theme:</span>
                <span className="ml-2 text-green-700">{campaignTopic.theme}</span>
              </div>
              <div>
                <span className="font-medium text-green-800">Goal:</span>
                <span className="ml-2 text-green-700">{campaignTopic.businessGoal}</span>
              </div>
              <div>
                <span className="font-medium text-green-800">Channel:</span>
                <span className="ml-2 text-green-700">{campaignTopic.primaryChannel}</span>
              </div>
            </div>
          </div>
        )}

        {/* Blog Configuration */}
        <div className="mb-8">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Blog Configuration</h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Topic and Settings */}
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Blog Topic *
                </label>
                <input
                  type="text"
                  value={generationOptions.topic || ''}
                  onChange={(e) => handleTopicChange(e.target.value)}
                  placeholder="e.g., 'How to Automate Your Business Workflows'"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  disabled={isGenerating}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Content Length
                </label>
                <select
                  value={generationOptions.contentLength}
                  onChange={(e) => setGenerationOptions(prev => ({ ...prev, contentLength: parseInt(e.target.value) }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  disabled={isGenerating}
                >
                  <option value={1500}>1,500 words (Short)</option>
                  <option value={2000}>2,000 words (Standard)</option>
                  <option value={2500}>2,500 words (Long)</option>
                  <option value={3000}>3,000 words (In-depth)</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Writing Tone
                </label>
                <select
                  value={generationOptions.tone}
                  onChange={(e) => setGenerationOptions(prev => ({ ...prev, tone: e.target.value as any }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  disabled={isGenerating}
                >
                  <option value="professional">Professional</option>
                  <option value="casual">Casual</option>
                  <option value="technical">Technical</option>
                  <option value="conversational">Conversational</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Call-to-Action Type
                </label>
                <select
                  value={generationOptions.callToActionType}
                  onChange={(e) => setGenerationOptions(prev => ({ ...prev, callToActionType: e.target.value as any }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  disabled={isGenerating}
                >
                  <option value="contact">Contact Us</option>
                  <option value="trial">Start Free Trial</option>
                  <option value="download">Download Guide</option>
                  <option value="subscribe">Subscribe Newsletter</option>
                  <option value="custom">Custom CTA</option>
                </select>
              </div>

              {generationOptions.callToActionType === 'custom' && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Custom Call-to-Action
                  </label>
                  <textarea
                    value={generationOptions.customCTA || ''}
                    onChange={(e) => setGenerationOptions(prev => ({ ...prev, customCTA: e.target.value }))}
                    placeholder="Enter your custom call-to-action text..."
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                    rows={3}
                    disabled={isGenerating}
                  />
                </div>
              )}
            </div>

            {/* Keywords Management */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Target Keywords
              </label>
              
              <div className="mb-3">
                <div className="flex space-x-2">
                  <input
                    type="text"
                    placeholder="Add keyword..."
                    className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                    disabled={isGenerating}
                    onKeyPress={(e) => {
                      if (e.key === 'Enter') {
                        handleKeywordAdd(e.currentTarget.value)
                        e.currentTarget.value = ''
                      }
                    }}
                  />
                  <button
                    onClick={() => {
                      const input = document.querySelector('input[placeholder="Add keyword..."]') as HTMLInputElement
                      if (input?.value) {
                        handleKeywordAdd(input.value)
                        input.value = ''
                      }
                    }}
                    disabled={isGenerating}
                    className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
                  >
                    Add
                  </button>
                </div>
              </div>

              <div className="space-y-2 max-h-32 overflow-y-auto">
                {generationOptions.targetKeywords?.map((keyword, index) => (
                  <div key={index} className="flex items-center justify-between bg-gray-50 px-3 py-2 rounded">
                    <span className="text-sm text-gray-700">{keyword}</span>
                    <button
                      onClick={() => handleKeywordRemove(keyword)}
                      disabled={isGenerating}
                      className="text-red-500 hover:text-red-700 text-sm"
                    >
                      Remove
                    </button>
                  </div>
                ))}
              </div>

              {(!generationOptions.targetKeywords || generationOptions.targetKeywords.length === 0) && (
                <p className="text-sm text-gray-500 mt-2">
                  Keywords will be auto-generated if none provided
                </p>
              )}

              {/* Advanced Options */}
              <div className="mt-6 space-y-3">
                <label className="flex items-center">
                  <input
                    type="checkbox"
                    checked={generationOptions.seoOptimization}
                    onChange={(e) => setGenerationOptions(prev => ({ ...prev, seoOptimization: e.target.checked }))}
                    disabled={isGenerating}
                    className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                  />
                  <span className="ml-2 text-sm text-gray-700">Advanced SEO optimization</span>
                </label>
                
                <label className="flex items-center">
                  <input
                    type="checkbox"
                    checked={generationOptions.includeImages}
                    onChange={(e) => setGenerationOptions(prev => ({ ...prev, includeImages: e.target.checked }))}
                    disabled={isGenerating}
                    className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                  />
                  <span className="ml-2 text-sm text-gray-700">Include image suggestions</span>
                </label>
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
            onClick={handleGenerateBlog}
            disabled={isGenerating || !companyDNA || !generationOptions.topic?.trim()}
            className={`px-8 py-3 rounded-lg font-semibold text-white transition-colors ${
              isGenerating || !companyDNA || !generationOptions.topic?.trim()
                ? 'bg-gray-400 cursor-not-allowed'
                : 'bg-blue-600 hover:bg-blue-700'
            }`}
          >
            {isGenerating ? (
              <div className="flex items-center space-x-2">
                <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                <span>Generating Blog Post...</span>
              </div>
            ) : (
              `Generate ${generationOptions.contentLength || 2000}-Word Blog Post`
            )}
          </button>
        </div>

        {/* Generated Blog Preview */}
        {generatedBlog && (
          <div className="border-t pt-8">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-2xl font-bold text-gray-900">
                📝 Generated Blog Post
              </h3>
              <div className="flex space-x-2">
                <button
                  onClick={() => handleExportBlog('markdown')}
                  className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors text-sm"
                >
                  Export Markdown
                </button>
                <button
                  onClick={() => handleExportBlog('html')}
                  className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors text-sm"
                >
                  Export HTML
                </button>
                <button
                  onClick={() => handleExportBlog('json')}
                  className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors text-sm"
                >
                  Export JSON
                </button>
              </div>
            </div>

            {/* Blog Metrics */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
              <div className="bg-gray-50 p-4 rounded-lg text-center">
                <div className="text-2xl font-bold text-gray-900">{generatedBlog.metadata.wordCount}</div>
                <div className="text-sm text-gray-600">Words</div>
              </div>
              
              <div className="bg-blue-50 p-4 rounded-lg text-center">
                <div className="text-2xl font-bold text-blue-600">{Math.round(generatedBlog.seoScore)}</div>
                <div className="text-sm text-gray-600">SEO Score</div>
              </div>
              
              <div className="bg-green-50 p-4 rounded-lg text-center">
                <div className="text-2xl font-bold text-green-600">{Math.round(generatedBlog.brandConsistencyScore * 100)}%</div>
                <div className="text-sm text-gray-600">Brand Consistency</div>
              </div>
              
              <div className="bg-purple-50 p-4 rounded-lg text-center">
                <div className="text-2xl font-bold text-purple-600">{generatedBlog.estimatedReadTime}</div>
                <div className="text-sm text-gray-600">Min Read</div>
              </div>
            </div>

            {/* Blog Title and Meta */}
            <div className="mb-6">
              <h4 className="text-xl font-bold text-gray-900 mb-2">{generatedBlog.title}</h4>
              {generatedBlog.subtitle && (
                <p className="text-lg text-gray-600 mb-2">{generatedBlog.subtitle}</p>
              )}
              <p className="text-sm text-gray-500 mb-4">{generatedBlog.metaDescription}</p>
              
              <div className="flex flex-wrap gap-2">
                {generatedBlog.keywords.map((keyword, index) => (
                  <span key={index} className="bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded">
                    {keyword}
                  </span>
                ))}
              </div>
            </div>

            {/* Blog Content Preview */}
            <div className="bg-white border border-gray-200 rounded-lg p-6 max-h-96 overflow-y-auto">
              <div className="prose max-w-none">
                <pre className="whitespace-pre-wrap font-sans text-sm leading-relaxed">
                  {generatedBlog.content.substring(0, 1000)}
                  {generatedBlog.content.length > 1000 && '...'}
                </pre>
              </div>
            </div>
            
            {generatedBlog.content.length > 1000 && (
              <p className="text-center text-sm text-gray-500 mt-2">
                Preview showing first 1000 characters. Export for full content.
              </p>
            )}
          </div>
        )}
      </div>
    </div>
  )
}