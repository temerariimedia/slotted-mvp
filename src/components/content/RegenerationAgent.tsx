import React, { useState, useCallback } from 'react'
import { useSlottedContext } from '../../contexts/SlottedContext'

interface RegenerationStyle {
  id: string
  name: string
  description: string
  icon: string
  prompt: string
}

interface RegenerationAgentProps {
  originalContent: string
  contentType: 'blog' | 'social' | 'email' | 'script'
  onRegenerate: (newContent: string, style: RegenerationStyle) => void
  onCancel: () => void
}

const REGENERATION_STYLES: RegenerationStyle[] = [
  {
    id: 'professional',
    name: 'Professional',
    description: 'Formal, business-focused tone with industry terminology',
    icon: '💼',
    prompt: 'Rewrite this content in a professional, business-focused tone with industry terminology and formal language.'
  },
  {
    id: 'casual',
    name: 'Casual & Friendly',
    description: 'Conversational, approachable tone like talking to a friend',
    icon: '😊',
    prompt: 'Rewrite this content in a casual, friendly tone as if you\'re having a conversation with a friend.'
  },
  {
    id: 'persuasive',
    name: 'Persuasive',
    description: 'Compelling, action-oriented content that drives engagement',
    icon: '🎯',
    prompt: 'Rewrite this content to be more persuasive and action-oriented, using compelling language that drives engagement.'
  },
  {
    id: 'educational',
    name: 'Educational',
    description: 'Informative, tutorial-style content that teaches concepts',
    icon: '📚',
    prompt: 'Rewrite this content in an educational, tutorial-style format that clearly explains concepts and provides value.'
  },
  {
    id: 'storytelling',
    name: 'Storytelling',
    description: 'Narrative-driven content that tells a compelling story',
    icon: '📖',
    prompt: 'Rewrite this content using storytelling techniques, creating a narrative that engages and captivates the audience.'
  },
  {
    id: 'technical',
    name: 'Technical',
    description: 'Detailed, technical content with specific data and examples',
    icon: '🔧',
    prompt: 'Rewrite this content with more technical details, specific data, and concrete examples.'
  },
  {
    id: 'simplified',
    name: 'Simplified',
    description: 'Clear, easy-to-understand content for broader audiences',
    icon: '✨',
    prompt: 'Rewrite this content in simpler, clearer language that\'s easy for a broad audience to understand.'
  },
  {
    id: 'creative',
    name: 'Creative',
    description: 'Innovative, unique approach with creative language',
    icon: '🎨',
    prompt: 'Rewrite this content with a creative, innovative approach using unique language and fresh perspectives.'
  }
]

export const RegenerationAgent: React.FC<RegenerationAgentProps> = ({
  originalContent,
  contentType,
  onRegenerate,
  onCancel
}) => {
  const { context } = useSlottedContext()
  const [selectedStyle, setSelectedStyle] = useState<RegenerationStyle | null>(null)
  const [customPrompt, setCustomPrompt] = useState('')
  const [isRegenerating, setIsRegenerating] = useState(false)
  const [regenerationHistory, setRegenerationHistory] = useState<Array<{
    id: string
    style: RegenerationStyle
    content: string
    timestamp: Date
  }>>([])

  const handleRegenerate = useCallback(async (style: RegenerationStyle) => {
    setIsRegenerating(true)
    setSelectedStyle(style)

    try {
      // Simulate AI regeneration (replace with actual AI call)
      const prompt = customPrompt || style.prompt
      const newContent = await simulateAIRegeneration(originalContent, prompt, contentType)
      
      const regeneration = {
        id: Date.now().toString(),
        style,
        content: newContent,
        timestamp: new Date()
      }

      setRegenerationHistory(prev => [...prev, regeneration])
      onRegenerate(newContent, style)
    } catch (error) {
      console.error('Regeneration failed:', error)
    } finally {
      setIsRegenerating(false)
    }
  }, [originalContent, customPrompt, contentType, onRegenerate])

  const simulateAIRegeneration = async (content: string, prompt: string, type: string): Promise<string> => {
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 2000))
    
    // This would be replaced with actual AI API call
    return `[Regenerated ${type} content with style: ${prompt}]\n\n${content}\n\n[This is a simulated regeneration. In production, this would call your AI provider with the specified prompt and context.]`
  }

  const getContentTypeIcon = () => {
    switch (contentType) {
      case 'blog': return '📝'
      case 'social': return '📱'
      case 'email': return '📧'
      case 'script': return '🎬'
      default: return '📄'
    }
  }

  return (
    <div className="bg-white rounded-lg shadow-lg border border-gray-200">
      {/* Header */}
      <div className="p-4 border-b border-gray-200">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <span className="text-2xl">🔄</span>
            <div>
              <h2 className="text-xl font-semibold text-gray-900">Regeneration Agent</h2>
              <p className="text-sm text-gray-500">
                Regenerate your {contentType} content with different styles and tones
              </p>
            </div>
          </div>
          <button
            onClick={onCancel}
            className="text-gray-400 hover:text-gray-600"
          >
            ✕
          </button>
        </div>
      </div>

      {/* Original Content Preview */}
      <div className="p-4 border-b border-gray-200 bg-gray-50">
        <h3 className="font-medium text-gray-900 mb-2">Original Content</h3>
        <div className="max-h-32 overflow-y-auto bg-white p-3 rounded border">
          <pre className="text-sm text-gray-700 whitespace-pre-wrap">
            {originalContent.substring(0, 300)}
            {originalContent.length > 300 ? '...' : ''}
          </pre>
        </div>
      </div>

      {/* Custom Prompt */}
      <div className="p-4 border-b border-gray-200">
        <h3 className="font-medium text-gray-900 mb-2">Custom Regeneration Prompt (Optional)</h3>
        <textarea
          value={customPrompt}
          onChange={(e) => setCustomPrompt(e.target.value)}
          placeholder="Describe how you want to regenerate this content..."
          className="w-full p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          rows={3}
        />
        <p className="text-xs text-gray-500 mt-1">
          Leave empty to use the predefined style prompts below
        </p>
      </div>

      {/* Style Selection */}
      <div className="p-4">
        <h3 className="font-medium text-gray-900 mb-4">Choose a Style</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {REGENERATION_STYLES.map((style) => (
            <div
              key={style.id}
              className={`p-4 border rounded-lg cursor-pointer transition-colors ${
                selectedStyle?.id === style.id
                  ? 'border-blue-500 bg-blue-50'
                  : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
              }`}
              onClick={() => handleRegenerate(style)}
            >
              <div className="flex items-center space-x-3 mb-2">
                <span className="text-2xl">{style.icon}</span>
                <h4 className="font-medium text-gray-900">{style.name}</h4>
              </div>
              <p className="text-sm text-gray-600 mb-3">{style.description}</p>
              {isRegenerating && selectedStyle?.id === style.id && (
                <div className="flex items-center space-x-2 text-blue-600">
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600"></div>
                  <span className="text-sm">Regenerating...</span>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Regeneration History */}
      {regenerationHistory.length > 0 && (
        <div className="p-4 border-t border-gray-200 bg-gray-50">
          <h3 className="font-medium text-gray-900 mb-3">Recent Regenerations</h3>
          <div className="space-y-3 max-h-48 overflow-y-auto">
            {regenerationHistory.slice(-3).reverse().map((regeneration) => (
              <div
                key={regeneration.id}
                className="bg-white p-3 rounded border border-gray-200"
              >
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center space-x-2">
                    <span className="text-lg">{regeneration.style.icon}</span>
                    <span className="font-medium text-gray-900">{regeneration.style.name}</span>
                  </div>
                  <span className="text-xs text-gray-500">
                    {regeneration.timestamp.toLocaleTimeString()}
                  </span>
                </div>
                <div className="text-sm text-gray-600 max-h-20 overflow-y-auto">
                  <pre className="whitespace-pre-wrap">
                    {regeneration.content.substring(0, 150)}
                    {regeneration.content.length > 150 ? '...' : ''}
                  </pre>
                </div>
                <button
                  onClick={() => onRegenerate(regeneration.content, regeneration.style)}
                  className="mt-2 text-xs text-blue-600 hover:text-blue-800"
                >
                  Use this version
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Context Information */}
      {context && (
        <div className="p-4 border-t border-gray-200 bg-blue-50">
          <h3 className="font-medium text-gray-900 mb-2">Using Context</h3>
          <div className="text-sm text-gray-600">
            <p>Regeneration will use your company context:</p>
            <ul className="list-disc list-inside mt-1 space-y-1">
              <li>Company: {context.companyName}</li>
              <li>Industry: {context.industry}</li>
              <li>Target Audience: {context.targetAudience}</li>
              <li>Brand Voice: {context.brandVoice}</li>
            </ul>
          </div>
        </div>
      )}
    </div>
  )
} 