import React, { useState, useCallback } from 'react'
import { useSlottedContext } from '../../contexts/SlottedContext'
import { modernAIOrchestrator } from '../../services/ai/modern-ai-orchestrator'

interface VideoScript {
  title: string
  script: string
  duration: number
  scenes: Array<{
    timeStart: number
    timeEnd: number
    description: string
    visualCue: string
    audio: string
  }>
  callToAction: string
}

interface ScriptGeneratorProps {
  topic?: string
  blogContent?: string
  onScriptGenerated: (script: VideoScript) => void
}

export const ScriptGenerator: React.FC<ScriptGeneratorProps> = ({
  topic = '',
  blogContent,
  onScriptGenerated
}) => {
  const { context } = useSlottedContext()
  const [isGenerating, setIsGenerating] = useState(false)
  const [generatedScript, setGeneratedScript] = useState<VideoScript | null>(null)
  const [currentStep, setCurrentStep] = useState('')
  const [progress, setProgress] = useState(0)
  const [scriptOptions, setScriptOptions] = useState({
    topic: topic,
    duration: 180, // 3 minutes
    style: 'conversational' as 'conversational' | 'professional' | 'casual' | 'educational',
    includeVisualCues: true,
    includeAudioNotes: true,
    targetAudience: 'general'
  })

  const handleGenerateScript = async () => {
    if (!context) {
      alert('Please complete onboarding first')
      return
    }

    if (!scriptOptions.topic?.trim()) {
      alert('Please enter a script topic')
      return
    }

    setIsGenerating(true)
    setProgress(0)
    setCurrentStep('Initializing script generation...')

    try {
      setCurrentStep('Analyzing topic and context...')
      setProgress(20)

      // Build the prompt for script generation
      const prompt = buildScriptPrompt(scriptOptions, context, blogContent)

      setCurrentStep('Generating video script...')
      setProgress(50)

      const response = await modernAIOrchestrator.generateContent({
        type: 'script',
        customInstructions: prompt,
        maxTokens: 3000
      })

      setCurrentStep('Structuring scenes and timing...')
      setProgress(80)

      const script = parseScriptResponse(response.content, scriptOptions)

      setCurrentStep('Finalizing script...')
      setProgress(100)

      setGeneratedScript(script)
      onScriptGenerated(script)
      setCurrentStep('Script generation complete!')
    } catch (error) {
      console.error('Script generation failed:', error)
      alert('Script generation failed. Please try again.')
      setCurrentStep('Generation failed')
    } finally {
      setIsGenerating(false)
    }
  }

  const buildScriptPrompt = (options: any, context: any, blogContent?: string) => {
    const sourceContent = blogContent ? `Based on this blog content:\n${blogContent}\n\n` : ''

    return `
COMPANY CONTEXT:
- Company: ${context.companyName}
- Industry: ${context.industry}
- Brand Voice: ${context.brandVoice}
- Target Audience: ${context.targetAudience}

${sourceContent}TASK: Create an engaging video script about "${options.topic}"

REQUIREMENTS:
- Hook viewers in first 5-10 seconds
- Clear value proposition early
- ${options.style} tone throughout
- Target duration: ${options.duration} seconds (${Math.round(options.duration / 60)} minutes)
- Include visual cues and scene descriptions
- Build to strong call-to-action
- Address audience: ${options.targetAudience}

SCRIPT STRUCTURE:
1. Hook (0-10 seconds)
2. Introduction and value proposition (10-30 seconds)
3. Main content (30-${options.duration - 30} seconds)
4. Call-to-action (last 30 seconds)

OUTPUT FORMAT:
Return as JSON with this exact structure:
{
  "title": "Compelling Video Title",
  "script": "Full script text with timing notes",
  "duration": ${options.duration},
  "scenes": [
    {
      "timeStart": 0,
      "timeEnd": 10,
      "description": "Scene description",
      "visualCue": "Visual instruction",
      "audio": "Audio note"
    }
  ],
  "callToAction": "Clear call to action"
}
`
  }

  const parseScriptResponse = (content: string, options: any): VideoScript => {
    try {
      // Try to extract JSON from the response
      const jsonMatch = content.match(/\{[\s\S]*\}/)
      if (jsonMatch) {
        const parsed = JSON.parse(jsonMatch[0])
        return {
          title: parsed.title || `Video Script: ${options.topic}`,
          script: parsed.script || content,
          duration: parsed.duration || options.duration,
          scenes: parsed.scenes || [],
          callToAction: parsed.callToAction || 'Contact us to learn more'
        }
      }
    } catch (error) {
      console.warn('Failed to parse JSON response, using fallback')
    }

    // Fallback: create basic script structure
    return {
      title: `Video Script: ${options.topic}`,
      script: content,
      duration: options.duration,
      scenes: [
        {
          timeStart: 0,
          timeEnd: 10,
          description: 'Opening hook',
          visualCue: 'Engaging visual',
          audio: 'Background music'
        },
        {
          timeStart: 10,
          timeEnd: options.duration - 30,
          description: 'Main content',
          visualCue: 'Supporting visuals',
          audio: 'Voiceover'
        },
        {
          timeStart: options.duration - 30,
          timeEnd: options.duration,
          description: 'Call to action',
          visualCue: 'Contact information',
          audio: 'Clear CTA'
        }
      ],
      callToAction: 'Contact us to learn more'
    }
  }

  const handleExportScript = (format: 'json' | 'txt' | 'pdf') => {
    if (!generatedScript) return

    let content = ''
    let filename = `script_${generatedScript.title.replace(/[^a-zA-Z0-9]/g, '_')}`

    switch (format) {
      case 'json':
        content = JSON.stringify(generatedScript, null, 2)
        filename += '.json'
        break
      case 'txt':
        content = `VIDEO SCRIPT: ${generatedScript.title}\n\n`
        content += `Duration: ${generatedScript.duration} seconds\n\n`
        content += `SCRIPT:\n${generatedScript.script}\n\n`
        content += `SCENES:\n`
        generatedScript.scenes.forEach((scene, index) => {
          content += `${index + 1}. ${scene.timeStart}s-${scene.timeEnd}s: ${scene.description}\n`
          content += `   Visual: ${scene.visualCue}\n`
          content += `   Audio: ${scene.audio}\n\n`
        })
        content += `CALL TO ACTION: ${generatedScript.callToAction}`
        filename += '.txt'
        break
      case 'pdf':
        // For PDF, we'd need a PDF library
        alert('PDF export not implemented yet')
        return
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

  return (
    <div className="bg-white rounded-lg shadow-lg border border-gray-200">
      {/* Header */}
      <div className="p-4 border-b border-gray-200">
        <div className="flex items-center space-x-3">
          <span className="text-2xl">🎬</span>
          <div>
            <h2 className="text-xl font-semibold text-gray-900">Video Script Generator</h2>
            <p className="text-sm text-gray-500">
              Create engaging video scripts with timing, visual cues, and audio notes
            </p>
          </div>
        </div>
      </div>

      {/* Generation Options */}
      <div className="p-4 border-b border-gray-200">
        <h3 className="font-medium text-gray-900 mb-4">Script Options</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Topic</label>
            <input
              type="text"
              value={scriptOptions.topic}
              onChange={(e) => setScriptOptions(prev => ({ ...prev, topic: e.target.value }))}
              placeholder="Enter script topic..."
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Duration (seconds)</label>
            <input
              type="number"
              value={scriptOptions.duration}
              onChange={(e) => setScriptOptions(prev => ({ ...prev, duration: parseInt(e.target.value) }))}
              min="30"
              max="600"
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Style</label>
            <select
              value={scriptOptions.style}
              onChange={(e) => setScriptOptions(prev => ({ ...prev, style: e.target.value as any }))}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="conversational">Conversational</option>
              <option value="professional">Professional</option>
              <option value="casual">Casual</option>
              <option value="educational">Educational</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Target Audience</label>
            <input
              type="text"
              value={scriptOptions.targetAudience}
              onChange={(e) => setScriptOptions(prev => ({ ...prev, targetAudience: e.target.value }))}
              placeholder="e.g., business professionals"
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>

          <div className="flex items-center space-x-4">
            <label className="flex items-center">
              <input
                type="checkbox"
                checked={scriptOptions.includeVisualCues}
                onChange={(e) => setScriptOptions(prev => ({ ...prev, includeVisualCues: e.target.checked }))}
                className="mr-2"
              />
              <span className="text-sm text-gray-700">Visual Cues</span>
            </label>
            <label className="flex items-center">
              <input
                type="checkbox"
                checked={scriptOptions.includeAudioNotes}
                onChange={(e) => setScriptOptions(prev => ({ ...prev, includeAudioNotes: e.target.checked }))}
                className="mr-2"
              />
              <span className="text-sm text-gray-700">Audio Notes</span>
            </label>
          </div>
        </div>

        <div className="mt-4">
          <button
            onClick={handleGenerateScript}
            disabled={isGenerating || !scriptOptions.topic.trim()}
            className="w-full px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isGenerating ? '🎬 Generating Script...' : '🎬 Generate Video Script'}
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

      {/* Generated Script */}
      {generatedScript && (
        <div className="p-4">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900">{generatedScript.title}</h3>
            <div className="flex space-x-2">
              <button
                onClick={() => handleExportScript('json')}
                className="px-3 py-1 text-sm bg-gray-600 text-white rounded-md hover:bg-gray-700"
              >
                Export JSON
              </button>
              <button
                onClick={() => handleExportScript('txt')}
                className="px-3 py-1 text-sm bg-gray-600 text-white rounded-md hover:bg-gray-700"
              >
                Export TXT
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Script Content */}
            <div>
              <h4 className="font-medium text-gray-900 mb-2">Script Content</h4>
              <div className="bg-gray-50 p-4 rounded-lg max-h-96 overflow-y-auto">
                <pre className="whitespace-pre-wrap text-sm text-gray-700">
                  {generatedScript.script}
                </pre>
              </div>
            </div>

            {/* Scenes */}
            <div>
              <h4 className="font-medium text-gray-900 mb-2">Scene Breakdown</h4>
              <div className="space-y-3 max-h-96 overflow-y-auto">
                {generatedScript.scenes.map((scene, index) => (
                  <div key={index} className="bg-gray-50 p-3 rounded-lg">
                    <div className="flex justify-between items-start mb-2">
                      <span className="font-medium text-gray-900">Scene {index + 1}</span>
                      <span className="text-sm text-gray-500">
                        {scene.timeStart}s - {scene.timeEnd}s
                      </span>
                    </div>
                    <div className="text-sm text-gray-700 space-y-1">
                      <div><strong>Description:</strong> {scene.description}</div>
                      <div><strong>Visual:</strong> {scene.visualCue}</div>
                      <div><strong>Audio:</strong> {scene.audio}</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Call to Action */}
          <div className="mt-4 p-4 bg-green-50 border border-green-200 rounded-lg">
            <h4 className="font-medium text-green-900 mb-2">Call to Action</h4>
            <p className="text-green-800">{generatedScript.callToAction}</p>
          </div>
        </div>
      )}
    </div>
  )
} 