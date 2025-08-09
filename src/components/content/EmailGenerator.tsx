import React, { useState, useCallback } from 'react'
import { useSlottedContext } from '../../contexts/SlottedContext'
import { modernAIOrchestrator } from '../../services/ai/modern-ai-orchestrator'

interface EmailCampaign {
  subject: string
  previewText: string
  content: string
  plainText: string
  callToAction: string
  segmentation: string[]
  metadata: {
    wordCount: number
    generatedAt: string
    type: string
    tone: string
  }
}

interface EmailGeneratorProps {
  topic?: string
  onEmailGenerated: (email: EmailCampaign) => void
}

export const EmailGenerator: React.FC<EmailGeneratorProps> = ({
  topic = '',
  onEmailGenerated
}) => {
  const { context } = useSlottedContext()
  const [isGenerating, setIsGenerating] = useState(false)
  const [generatedEmail, setGeneratedEmail] = useState<EmailCampaign | null>(null)
  const [currentStep, setCurrentStep] = useState('')
  const [progress, setProgress] = useState(0)
  const [emailOptions, setEmailOptions] = useState({
    topic: topic,
    type: 'newsletter' as 'newsletter' | 'promotion' | 'announcement' | 'nurture',
    tone: 'conversational' as 'conversational' | 'professional' | 'casual' | 'urgent',
    length: 500,
    includePersonalization: true,
    includeSegmentation: true,
    targetAudience: 'subscribers'
  })

  const handleGenerateEmail = async () => {
    if (!context) {
      alert('Please complete onboarding first')
      return
    }

    if (!emailOptions.topic?.trim()) {
      alert('Please enter an email topic')
      return
    }

    setIsGenerating(true)
    setProgress(0)
    setCurrentStep('Initializing email generation...')

    try {
      setCurrentStep('Analyzing topic and audience...')
      setProgress(20)

      const prompt = buildEmailPrompt(emailOptions, context)

      setCurrentStep('Generating email content...')
      setProgress(50)

      const response = await modernAIOrchestrator.generateContent({
        type: 'email',
        customInstructions: prompt,
        maxTokens: 2000
      })

      setCurrentStep('Optimizing subject line and preview...')
      setProgress(80)

      const email = parseEmailResponse(response.content, emailOptions)

      setCurrentStep('Finalizing email...')
      setProgress(100)

      setGeneratedEmail(email)
      onEmailGenerated(email)
      setCurrentStep('Email generation complete!')
    } catch (error) {
      console.error('Email generation failed:', error)
      alert('Email generation failed. Please try again.')
      setCurrentStep('Generation failed')
    } finally {
      setIsGenerating(false)
    }
  }

  const buildEmailPrompt = (options: any, context: any) => {
    return `
COMPANY CONTEXT:
- Company: ${context.companyName}
- Industry: ${context.industry}
- Brand Voice: ${context.brandVoice}
- Target Audience: ${context.targetAudience}

TASK: Create a ${options.type} email about "${options.topic}"

REQUIREMENTS:
- Compelling subject line (under 50 characters)
- Preview text that complements subject line
- Email length: ${options.length} words
- ${options.tone} tone throughout
- Mobile-friendly formatting
- Clear value proposition
- Strong call-to-action
- Target audience: ${options.targetAudience}
- Include personalization tokens if needed
- Brand voice consistency

EMAIL STRUCTURE:
1. Subject Line (compelling and clear)
2. Preview Text (supports subject line)
3. Greeting (personalized if possible)
4. Opening hook
5. Main content (value delivery)
6. Call-to-action
7. Signature

OUTPUT FORMAT:
Return as JSON with this exact structure:
{
  "subject": "Compelling subject line under 50 chars",
  "previewText": "Preview text that appears in email clients",
  "content": "Full HTML email content with proper formatting",
  "plainText": "Plain text version for accessibility",
  "callToAction": "Clear call to action text",
  "segmentation": ["segment1", "segment2"],
  "metadata": {
    "wordCount": ${options.length},
    "generatedAt": "${new Date().toISOString()}",
    "type": "${options.type}",
    "tone": "${options.tone}"
  }
}
`
  }

  const parseEmailResponse = (content: string, options: any): EmailCampaign => {
    try {
      const jsonMatch = content.match(/\{[\s\S]*\}/)
      if (jsonMatch) {
        const parsed = JSON.parse(jsonMatch[0])
        return {
          subject: parsed.subject || `Email: ${options.topic}`,
          previewText: parsed.previewText || 'Check out our latest update',
          content: parsed.content || content,
          plainText: parsed.plainText || content.replace(/<[^>]*>/g, ''),
          callToAction: parsed.callToAction || 'Learn more',
          segmentation: parsed.segmentation || ['general'],
          metadata: {
            wordCount: parsed.metadata?.wordCount || options.length,
            generatedAt: parsed.metadata?.generatedAt || new Date().toISOString(),
            type: parsed.metadata?.type || options.type,
            tone: parsed.metadata?.tone || options.tone
          }
        }
      }
    } catch (error) {
      console.warn('Failed to parse JSON response, using fallback')
    }

    // Fallback: create basic email structure
    return {
      subject: `Email: ${options.topic}`,
      previewText: 'Check out our latest update',
      content: content,
      plainText: content.replace(/<[^>]*>/g, ''),
      callToAction: 'Learn more',
      segmentation: ['general'],
      metadata: {
        wordCount: options.length,
        generatedAt: new Date().toISOString(),
        type: options.type,
        tone: options.tone
      }
    }
  }

  const handleExportEmail = (format: 'html' | 'txt' | 'json') => {
    if (!generatedEmail) return

    let content = ''
    let filename = `email_${generatedEmail.subject.replace(/[^a-zA-Z0-9]/g, '_')}`

    switch (format) {
      case 'html':
        content = `
<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>${generatedEmail.subject}</title>
</head>
<body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333;">
    ${generatedEmail.content}
</body>
</html>`
        filename += '.html'
        break
      case 'txt':
        content = `SUBJECT: ${generatedEmail.subject}\n`
        content += `PREVIEW: ${generatedEmail.previewText}\n\n`
        content += generatedEmail.plainText
        filename += '.txt'
        break
      case 'json':
        content = JSON.stringify(generatedEmail, null, 2)
        filename += '.json'
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

  const getEmailTypeIcon = (type: string) => {
    switch (type) {
      case 'newsletter': return '📧'
      case 'promotion': return '💰'
      case 'announcement': return '📢'
      case 'nurture': return '🌱'
      default: return '📧'
    }
  }

  return (
    <div className="bg-white rounded-lg shadow-lg border border-gray-200">
      {/* Header */}
      <div className="p-4 border-b border-gray-200">
        <div className="flex items-center space-x-3">
          <span className="text-2xl">{getEmailTypeIcon(emailOptions.type)}</span>
          <div>
            <h2 className="text-xl font-semibold text-gray-900">Email Campaign Generator</h2>
            <p className="text-sm text-gray-500">
              Create compelling email campaigns with subject lines, preview text, and mobile-friendly content
            </p>
          </div>
        </div>
      </div>

      {/* Generation Options */}
      <div className="p-4 border-b border-gray-200">
        <h3 className="font-medium text-gray-900 mb-4">Email Options</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Topic</label>
            <input
              type="text"
              value={emailOptions.topic}
              onChange={(e) => setEmailOptions(prev => ({ ...prev, topic: e.target.value }))}
              placeholder="Enter email topic..."
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Email Type</label>
            <select
              value={emailOptions.type}
              onChange={(e) => setEmailOptions(prev => ({ ...prev, type: e.target.value as any }))}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="newsletter">Newsletter</option>
              <option value="promotion">Promotion</option>
              <option value="announcement">Announcement</option>
              <option value="nurture">Nurture</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Tone</label>
            <select
              value={emailOptions.tone}
              onChange={(e) => setEmailOptions(prev => ({ ...prev, tone: e.target.value as any }))}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="conversational">Conversational</option>
              <option value="professional">Professional</option>
              <option value="casual">Casual</option>
              <option value="urgent">Urgent</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Length (words)</label>
            <input
              type="number"
              value={emailOptions.length}
              onChange={(e) => setEmailOptions(prev => ({ ...prev, length: parseInt(e.target.value) }))}
              min="100"
              max="1000"
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Target Audience</label>
            <input
              type="text"
              value={emailOptions.targetAudience}
              onChange={(e) => setEmailOptions(prev => ({ ...prev, targetAudience: e.target.value }))}
              placeholder="e.g., subscribers, leads, customers"
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>

          <div className="flex items-center space-x-4">
            <label className="flex items-center">
              <input
                type="checkbox"
                checked={emailOptions.includePersonalization}
                onChange={(e) => setEmailOptions(prev => ({ ...prev, includePersonalization: e.target.checked }))}
                className="mr-2"
              />
              <span className="text-sm text-gray-700">Personalization</span>
            </label>
            <label className="flex items-center">
              <input
                type="checkbox"
                checked={emailOptions.includeSegmentation}
                onChange={(e) => setEmailOptions(prev => ({ ...prev, includeSegmentation: e.target.checked }))}
                className="mr-2"
              />
              <span className="text-sm text-gray-700">Segmentation</span>
            </label>
          </div>
        </div>

        <div className="mt-4">
          <button
            onClick={handleGenerateEmail}
            disabled={isGenerating || !emailOptions.topic.trim()}
            className="w-full px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isGenerating ? '📧 Generating Email...' : '📧 Generate Email Campaign'}
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

      {/* Generated Email */}
      {generatedEmail && (
        <div className="p-4">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900">Generated Email Campaign</h3>
            <div className="flex space-x-2">
              <button
                onClick={() => handleExportEmail('html')}
                className="px-3 py-1 text-sm bg-gray-600 text-white rounded-md hover:bg-gray-700"
              >
                Export HTML
              </button>
              <button
                onClick={() => handleExportEmail('txt')}
                className="px-3 py-1 text-sm bg-gray-600 text-white rounded-md hover:bg-gray-700"
              >
                Export TXT
              </button>
              <button
                onClick={() => handleExportEmail('json')}
                className="px-3 py-1 text-sm bg-gray-600 text-white rounded-md hover:bg-gray-700"
              >
                Export JSON
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Email Content */}
            <div>
              <h4 className="font-medium text-gray-900 mb-2">Email Content</h4>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Subject Line</label>
                  <div className="p-3 bg-gray-50 rounded-lg border">
                    <p className="text-gray-900 font-medium">{generatedEmail.subject}</p>
                  </div>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Preview Text</label>
                  <div className="p-3 bg-gray-50 rounded-lg border">
                    <p className="text-gray-700">{generatedEmail.previewText}</p>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Email Content (HTML)</label>
                  <div className="bg-gray-50 p-4 rounded-lg border max-h-96 overflow-y-auto">
                    <div dangerouslySetInnerHTML={{ __html: generatedEmail.content }} />
                  </div>
                </div>
              </div>
            </div>

            {/* Email Details */}
            <div>
              <h4 className="font-medium text-gray-900 mb-2">Email Details</h4>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Call to Action</label>
                  <div className="p-3 bg-green-50 rounded-lg border border-green-200">
                    <p className="text-green-800 font-medium">{generatedEmail.callToAction}</p>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Plain Text Version</label>
                  <div className="bg-gray-50 p-4 rounded-lg border max-h-48 overflow-y-auto">
                    <pre className="whitespace-pre-wrap text-sm text-gray-700">
                      {generatedEmail.plainText}
                    </pre>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Segmentation</label>
                  <div className="flex flex-wrap gap-2">
                    {generatedEmail.segmentation.map((segment, index) => (
                      <span
                        key={index}
                        className="px-2 py-1 bg-blue-100 text-blue-800 rounded-full text-xs"
                      >
                        {segment}
                      </span>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Metadata</label>
                  <div className="bg-gray-50 p-3 rounded-lg">
                    <div className="grid grid-cols-2 gap-2 text-sm">
                      <div><span className="font-medium">Type:</span> {generatedEmail.metadata.type}</div>
                      <div><span className="font-medium">Tone:</span> {generatedEmail.metadata.tone}</div>
                      <div><span className="font-medium">Word Count:</span> {generatedEmail.metadata.wordCount}</div>
                      <div><span className="font-medium">Generated:</span> {new Date(generatedEmail.metadata.generatedAt).toLocaleString()}</div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
} 