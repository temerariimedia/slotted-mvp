import React, { useState, useCallback } from 'react'
import { useSlottedContext } from '../../contexts/SlottedContext'
import { modernAIOrchestrator } from '../../services/ai/modern-ai-orchestrator'

interface SocialPost {
  post: string
  hashtags: string[]
  timing: string
  engagement: string
  visualSuggestions: string[]
  platform: string
  metadata: {
    characterCount: number
    generatedAt: string
    tone: string
    type: string
  }
}

interface SocialMediaGeneratorProps {
  topic?: string
  onPostsGenerated: (posts: Record<string, SocialPost>) => void
}

const PLATFORMS = [
  { id: 'linkedin', name: 'LinkedIn', icon: '💼', maxChars: 3000 },
  { id: 'twitter', name: 'Twitter', icon: '🐦', maxChars: 280 },
  { id: 'facebook', name: 'Facebook', icon: '📘', maxChars: 63206 },
  { id: 'instagram', name: 'Instagram', icon: '📷', maxChars: 2200 },
  { id: 'tiktok', name: 'TikTok', icon: '🎵', maxChars: 150 }
]

export const SocialMediaGenerator: React.FC<SocialMediaGeneratorProps> = ({
  topic = '',
  onPostsGenerated
}) => {
  const { context } = useSlottedContext()
  const [isGenerating, setIsGenerating] = useState(false)
  const [generatedPosts, setGeneratedPosts] = useState<Record<string, SocialPost>>({})
  const [currentStep, setCurrentStep] = useState('')
  const [progress, setProgress] = useState(0)
  const [socialOptions, setSocialOptions] = useState({
    topic: topic,
    selectedPlatforms: ['linkedin', 'twitter'] as string[],
    tone: 'conversational' as 'conversational' | 'professional' | 'casual' | 'engaging',
    postType: 'educational' as 'educational' | 'promotional' | 'entertaining' | 'news',
    includeHashtags: true,
    includeTiming: true,
    includeVisualSuggestions: true,
    targetAudience: 'general'
  })

  const handleGeneratePosts = async () => {
    if (!context) {
      alert('Please complete onboarding first')
      return
    }

    if (!socialOptions.topic?.trim()) {
      alert('Please enter a topic')
      return
    }

    if (socialOptions.selectedPlatforms.length === 0) {
      alert('Please select at least one platform')
      return
    }

    setIsGenerating(true)
    setProgress(0)
    setCurrentStep('Initializing social media generation...')

    try {
      const posts: Record<string, SocialPost> = {}
      const totalPlatforms = socialOptions.selectedPlatforms.length

      for (let i = 0; i < socialOptions.selectedPlatforms.length; i++) {
        const platform = socialOptions.selectedPlatforms[i]
        const platformInfo = PLATFORMS.find(p => p.id === platform)
        
        setCurrentStep(`Generating ${platformInfo?.name} post...`)
        setProgress((i / totalPlatforms) * 100)

        const prompt = buildSocialPrompt(socialOptions, context, platform, platformInfo)
        
        const response = await modernAIOrchestrator.generateContent({
          type: 'social',
          customInstructions: prompt,
          maxTokens: 1000
        })

        const post = parseSocialResponse(response.content, platform, socialOptions)
        posts[platform] = post

        // Small delay to show progress
        await new Promise(resolve => setTimeout(resolve, 500))
      }

      setCurrentStep('Finalizing posts...')
      setProgress(100)

      setGeneratedPosts(posts)
      onPostsGenerated(posts)
      setCurrentStep('Social media generation complete!')
    } catch (error) {
      console.error('Social media generation failed:', error)
      alert('Social media generation failed. Please try again.')
      setCurrentStep('Generation failed')
    } finally {
      setIsGenerating(false)
    }
  }

  const buildSocialPrompt = (options: any, context: any, platform: string, platformInfo: any) => {
    const platformRequirements = getPlatformRequirements(platform)
    
    return `
COMPANY CONTEXT:
- Company: ${context.companyName}
- Industry: ${context.industry}
- Brand Voice: ${context.brandVoice}
- Target Audience: ${context.targetAudience}

TASK: Create a ${platform} post about "${options.topic}"

PLATFORM REQUIREMENTS:
${platformRequirements}

BRAND REQUIREMENTS:
- Voice: ${options.tone}
- Type: ${options.postType}
- Target audience: ${options.targetAudience}
- Brand voice consistency with ${context.brandVoice}

CONTENT REQUIREMENTS:
- Maximum ${platformInfo?.maxChars} characters
- Engaging and shareable content
- Platform-specific best practices
- Include relevant hashtags
- Suggest optimal posting time
- Include visual content suggestions
- Clear call-to-action

OUTPUT FORMAT:
Return as JSON with this exact structure:
{
  "post": "Main post content optimized for ${platform}",
  "hashtags": ["hashtag1", "hashtag2", "hashtag3"],
  "timing": "Best time to post (e.g., Tuesday 9 AM)",
  "engagement": "Suggested engagement tactics",
  "visualSuggestions": ["visual1", "visual2"],
  "platform": "${platform}",
  "metadata": {
    "characterCount": 0,
    "generatedAt": "${new Date().toISOString()}",
    "tone": "${options.tone}",
    "type": "${options.postType}"
  }
}
`
  }

  const getPlatformRequirements = (platform: string): string => {
    switch (platform) {
      case 'linkedin':
        return `
- Professional tone
- Industry insights and thought leadership
- Longer form content (up to 3000 characters)
- Focus on business value and networking
- Use professional hashtags
- Include statistics or data when relevant
- Best times: Tuesday-Thursday, 8-10 AM or 5-6 PM`
      
      case 'twitter':
        return `
- Concise and engaging (280 character limit)
- Use trending hashtags strategically
- Include mentions and retweets
- Quick, actionable insights
- Best times: Monday-Friday, 8-10 AM or 6-9 PM
- Use emojis sparingly but effectively`
      
      case 'facebook':
        return `
- Conversational and community-focused
- Longer posts work well
- Include questions to encourage engagement
- Share behind-the-scenes content
- Best times: Thursday-Sunday, 1-4 PM
- Use Facebook-specific features (polls, events)`
      
      case 'instagram':
        return `
- Visual-first content
- Use relevant hashtags (up to 30)
- Include emojis and visual elements
- Story-driven content
- Best times: Wednesday 3 PM, Thursday 5 AM/PM
- Focus on aesthetics and lifestyle`
      
      case 'tiktok':
        return `
- Short, engaging content (150 character limit)
- Trend-focused and entertaining
- Use popular hashtags and sounds
- Include call-to-action
- Best times: Tuesday-Thursday, 6-10 PM
- Focus on viral potential`
      
      default:
        return '- General social media best practices'
    }
  }

  const parseSocialResponse = (content: string, platform: string, options: any): SocialPost => {
    try {
      const jsonMatch = content.match(/\{[\s\S]*\}/)
      if (jsonMatch) {
        const parsed = JSON.parse(jsonMatch[0])
        return {
          post: parsed.post || content,
          hashtags: parsed.hashtags || [],
          timing: parsed.timing || 'Best time to post',
          engagement: parsed.engagement || 'Engage with comments and shares',
          visualSuggestions: parsed.visualSuggestions || [],
          platform,
          metadata: {
            characterCount: parsed.metadata?.characterCount || content.length,
            generatedAt: parsed.metadata?.generatedAt || new Date().toISOString(),
            tone: parsed.metadata?.tone || options.tone,
            type: parsed.metadata?.type || options.postType
          }
        }
      }
    } catch (error) {
      console.warn('Failed to parse JSON response, using fallback')
    }

    // Fallback: create basic post structure
    return {
      post: content,
      hashtags: ['#content', '#marketing'],
      timing: 'Best time to post',
      engagement: 'Engage with comments and shares',
      visualSuggestions: ['Relevant image or video'],
      platform,
      metadata: {
        characterCount: content.length,
        generatedAt: new Date().toISOString(),
        tone: options.tone,
        type: options.postType
      }
    }
  }

  const handleExportPosts = (format: 'json' | 'txt') => {
    if (Object.keys(generatedPosts).length === 0) return

    let content = ''
    let filename = `social_posts_${socialOptions.topic.replace(/[^a-zA-Z0-9]/g, '_')}`

    switch (format) {
      case 'json':
        content = JSON.stringify(generatedPosts, null, 2)
        filename += '.json'
        break
      case 'txt':
        content = `SOCIAL MEDIA POSTS: ${socialOptions.topic}\n\n`
        Object.entries(generatedPosts).forEach(([platform, post]) => {
          const platformInfo = PLATFORMS.find(p => p.id === platform)
          content += `${platformInfo?.icon} ${platformInfo?.name.toUpperCase()}\n`
          content += `Post: ${post.post}\n`
          content += `Hashtags: ${post.hashtags.join(' ')}\n`
          content += `Timing: ${post.timing}\n`
          content += `Engagement: ${post.engagement}\n`
          content += `Visual Suggestions: ${post.visualSuggestions.join(', ')}\n`
          content += `Character Count: ${post.metadata.characterCount}\n\n`
        })
        filename += '.txt'
        break
    }

    const blob = new Blob([content], { type: 'text/plain' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = filename
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
  }

  const togglePlatform = (platformId: string) => {
    setSocialOptions(prev => ({
      ...prev,
      selectedPlatforms: prev.selectedPlatforms.includes(platformId)
        ? prev.selectedPlatforms.filter(p => p !== platformId)
        : [...prev.selectedPlatforms, platformId]
    }))
  }

  return (
    <div className="bg-white rounded-lg shadow-lg border border-gray-200">
      {/* Header */}
      <div className="p-4 border-b border-gray-200">
        <div className="flex items-center space-x-3">
          <span className="text-2xl">📱</span>
          <div>
            <h2 className="text-xl font-semibold text-gray-900">Social Media Generator</h2>
            <p className="text-sm text-gray-500">
              Create platform-optimized social media posts with hashtags and engagement strategies
            </p>
          </div>
        </div>
      </div>

      {/* Generation Options */}
      <div className="p-4 border-b border-gray-200">
        <h3 className="font-medium text-gray-900 mb-4">Social Media Options</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Topic</label>
            <input
              type="text"
              value={socialOptions.topic}
              onChange={(e) => setSocialOptions(prev => ({ ...prev, topic: e.target.value }))}
              placeholder="Enter social media topic..."
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Post Type</label>
            <select
              value={socialOptions.postType}
              onChange={(e) => setSocialOptions(prev => ({ ...prev, postType: e.target.value as any }))}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="educational">Educational</option>
              <option value="promotional">Promotional</option>
              <option value="entertaining">Entertaining</option>
              <option value="news">News</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Tone</label>
            <select
              value={socialOptions.tone}
              onChange={(e) => setSocialOptions(prev => ({ ...prev, tone: e.target.value as any }))}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="conversational">Conversational</option>
              <option value="professional">Professional</option>
              <option value="casual">Casual</option>
              <option value="engaging">Engaging</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Target Audience</label>
            <input
              type="text"
              value={socialOptions.targetAudience}
              onChange={(e) => setSocialOptions(prev => ({ ...prev, targetAudience: e.target.value }))}
              placeholder="e.g., professionals, millennials"
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
        </div>

        {/* Platform Selection */}
        <div className="mt-4">
          <label className="block text-sm font-medium text-gray-700 mb-2">Select Platforms</label>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3">
            {PLATFORMS.map((platform) => (
              <label
                key={platform.id}
                className={`flex items-center p-3 border rounded-lg cursor-pointer transition-colors ${
                  socialOptions.selectedPlatforms.includes(platform.id)
                    ? 'border-blue-500 bg-blue-50'
                    : 'border-gray-300 hover:border-gray-400'
                }`}
              >
                <input
                  type="checkbox"
                  checked={socialOptions.selectedPlatforms.includes(platform.id)}
                  onChange={() => togglePlatform(platform.id)}
                  className="mr-2"
                />
                <div className="flex items-center">
                  <span className="text-lg mr-2">{platform.icon}</span>
                  <div>
                    <div className="font-medium text-sm">{platform.name}</div>
                    <div className="text-xs text-gray-500">{platform.maxChars} chars</div>
                  </div>
                </div>
              </label>
            ))}
          </div>
        </div>

        <div className="mt-4">
          <button
            onClick={handleGeneratePosts}
            disabled={isGenerating || !socialOptions.topic.trim() || socialOptions.selectedPlatforms.length === 0}
            className="w-full px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isGenerating ? '📱 Generating Posts...' : '📱 Generate Social Media Posts'}
          </button>
        </div>
      </div>

      {/* Progress */}
      {isGenerating && (
        <div className="p-4 border-b border-gray-200 bg-blue-50">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium text-blue-900">{currentStep}</span>
            <span className="text-sm text-blue-700">{progress}%</span>
          </div>
          <div className="w-full bg-blue-200 rounded-full h-2">
            <div
              className="bg-blue-600 h-2 rounded-full transition-all duration-300"
              style={{ width: `${progress}%` }}
            ></div>
          </div>
        </div>
      )}

      {/* Generated Posts */}
      {Object.keys(generatedPosts).length > 0 && (
        <div className="p-4">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900">Generated Social Media Posts</h3>
            <div className="flex space-x-2">
              <button
                onClick={() => handleExportPosts('json')}
                className="px-3 py-1 text-sm bg-gray-600 text-white rounded-md hover:bg-gray-700"
              >
                Export JSON
              </button>
              <button
                onClick={() => handleExportPosts('txt')}
                className="px-3 py-1 text-sm bg-gray-600 text-white rounded-md hover:bg-gray-700"
              >
                Export TXT
              </button>
            </div>
          </div>

          <div className="space-y-6">
            {Object.entries(generatedPosts).map(([platform, post]) => {
              const platformInfo = PLATFORMS.find(p => p.id === platform)
              return (
                <div key={platform} className="border border-gray-200 rounded-lg p-4">
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center space-x-2">
                      <span className="text-2xl">{platformInfo?.icon}</span>
                      <h4 className="text-lg font-semibold text-gray-900">{platformInfo?.name}</h4>
                    </div>
                    <span className="text-sm text-gray-500">
                      {post.metadata.characterCount} / {platformInfo?.maxChars} chars
                    </span>
                  </div>

                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    {/* Post Content */}
                    <div>
                      <h5 className="font-medium text-gray-900 mb-2">Post Content</h5>
                      <div className="bg-gray-50 p-4 rounded-lg border">
                        <p className="text-gray-700 whitespace-pre-wrap">{post.post}</p>
                      </div>
                    </div>

                    {/* Post Details */}
                    <div className="space-y-4">
                      <div>
                        <h5 className="font-medium text-gray-900 mb-2">Hashtags</h5>
                        <div className="flex flex-wrap gap-2">
                          {post.hashtags.map((hashtag, index) => (
                            <span
                              key={index}
                              className="px-2 py-1 bg-blue-100 text-blue-800 rounded-full text-sm"
                            >
                              {hashtag}
                            </span>
                          ))}
                        </div>
                      </div>

                      <div>
                        <h5 className="font-medium text-gray-900 mb-2">Timing</h5>
                        <p className="text-gray-700">{post.timing}</p>
                      </div>

                      <div>
                        <h5 className="font-medium text-gray-900 mb-2">Engagement Strategy</h5>
                        <p className="text-gray-700">{post.engagement}</p>
                      </div>

                      <div>
                        <h5 className="font-medium text-gray-900 mb-2">Visual Suggestions</h5>
                        <ul className="list-disc list-inside text-gray-700 space-y-1">
                          {post.visualSuggestions.map((suggestion, index) => (
                            <li key={index}>{suggestion}</li>
                          ))}
                        </ul>
                      </div>
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      )}
    </div>
  )
} 