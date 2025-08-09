import React, { useState, useCallback, useEffect } from 'react'
import { useSlottedContext } from '../../contexts/SlottedContext'

interface ContentVersion {
  id: string
  content: string
  timestamp: Date
  author: string
  changes: string
}

interface ContentEditorProps {
  initialContent?: string
  contentType: 'blog' | 'social' | 'email' | 'script'
  onSave: (content: string, version: ContentVersion) => void
  onApprove?: (content: string) => void
  onRegenerate?: (prompt: string) => Promise<string>
}

export const ContentEditor: React.FC<ContentEditorProps> = ({
  initialContent = '',
  contentType,
  onSave,
  onApprove,
  onRegenerate
}) => {
  const { context } = useSlottedContext()
  const [content, setContent] = useState(initialContent)
  const [versions, setVersions] = useState<ContentVersion[]>([])
  const [currentVersion, setCurrentVersion] = useState<ContentVersion | null>(null)
  const [isEditing, setIsEditing] = useState(false)
  const [isRegenerating, setIsRegenerating] = useState(false)
  const [regenerationPrompt, setRegenerationPrompt] = useState('')
  const [showVersionHistory, setShowVersionHistory] = useState(false)

  // Initialize first version
  useEffect(() => {
    if (initialContent && versions.length === 0) {
      const initialVersion: ContentVersion = {
        id: Date.now().toString(),
        content: initialContent,
        timestamp: new Date(),
        author: 'AI Generated',
        changes: 'Initial content'
      }
      setVersions([initialVersion])
      setCurrentVersion(initialVersion)
    }
  }, [initialContent, versions.length])

  const handleSave = useCallback(() => {
    if (!content.trim()) return

    const newVersion: ContentVersion = {
      id: Date.now().toString(),
      content,
      timestamp: new Date(),
      author: 'User',
      changes: 'Manual edit'
    }

    setVersions(prev => [...prev, newVersion])
    setCurrentVersion(newVersion)
    onSave(content, newVersion)
    setIsEditing(false)
  }, [content, onSave])

  const handleRegenerate = useCallback(async () => {
    if (!onRegenerate || !regenerationPrompt.trim()) return

    setIsRegenerating(true)
    try {
      const newContent = await onRegenerate(regenerationPrompt)
      setContent(newContent)
      
      const newVersion: ContentVersion = {
        id: Date.now().toString(),
        content: newContent,
        timestamp: new Date(),
        author: 'AI Regenerated',
        changes: `Regenerated with prompt: ${regenerationPrompt}`
      }

      setVersions(prev => [...prev, newVersion])
      setCurrentVersion(newVersion)
      setRegenerationPrompt('')
    } catch (error) {
      console.error('Regeneration failed:', error)
    } finally {
      setIsRegenerating(false)
    }
  }, [onRegenerate, regenerationPrompt])

  const handleVersionRestore = useCallback((version: ContentVersion) => {
    setContent(version.content)
    setCurrentVersion(version)
    setIsEditing(true)
  }, [])

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
      <div className="flex items-center justify-between p-4 border-b border-gray-200">
        <div className="flex items-center space-x-3">
          <span className="text-2xl">{getContentTypeIcon()}</span>
          <div>
            <h3 className="text-lg font-semibold text-gray-900 capitalize">
              {contentType} Editor
            </h3>
            <p className="text-sm text-gray-500">
              {currentVersion ? `Last edited: ${currentVersion.timestamp.toLocaleString()}` : 'New content'}
            </p>
          </div>
        </div>
        
        <div className="flex items-center space-x-2">
          <button
            onClick={() => setShowVersionHistory(!showVersionHistory)}
            className="px-3 py-1 text-sm bg-gray-100 text-gray-700 rounded-md hover:bg-gray-200"
          >
            📚 History
          </button>
          {onApprove && (
            <button
              onClick={() => onApprove(content)}
              className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700"
            >
              ✅ Approve
            </button>
          )}
        </div>
      </div>

      {/* Version History Sidebar */}
      {showVersionHistory && (
        <div className="border-b border-gray-200 bg-gray-50 p-4">
          <h4 className="font-medium text-gray-900 mb-3">Version History</h4>
          <div className="space-y-2 max-h-40 overflow-y-auto">
            {versions.map((version) => (
              <div
                key={version.id}
                className={`p-2 rounded cursor-pointer ${
                  currentVersion?.id === version.id
                    ? 'bg-blue-100 border border-blue-300'
                    : 'bg-white border border-gray-200 hover:bg-gray-50'
                }`}
                onClick={() => handleVersionRestore(version)}
              >
                <div className="flex justify-between items-start">
                  <div>
                    <p className="text-sm font-medium text-gray-900">{version.author}</p>
                    <p className="text-xs text-gray-500">{version.changes}</p>
                  </div>
                  <span className="text-xs text-gray-400">
                    {version.timestamp.toLocaleTimeString()}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Regeneration Panel */}
      {onRegenerate && (
        <div className="border-b border-gray-200 p-4 bg-blue-50">
          <div className="flex items-center space-x-3">
            <input
              type="text"
              value={regenerationPrompt}
              onChange={(e) => setRegenerationPrompt(e.target.value)}
              placeholder="Describe how you want to regenerate this content..."
              className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
            <button
              onClick={handleRegenerate}
              disabled={isRegenerating || !regenerationPrompt.trim()}
              className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isRegenerating ? '🔄 Regenerating...' : '🔄 Regenerate'}
            </button>
          </div>
        </div>
      )}

      {/* Content Editor */}
      <div className="p-4">
        <div className="mb-4">
          <textarea
            value={content}
            onChange={(e) => {
              setContent(e.target.value)
              setIsEditing(true)
            }}
            placeholder={`Start editing your ${contentType} content...`}
            className="w-full h-96 p-4 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
          />
        </div>

        {/* Word Count and Actions */}
        <div className="flex items-center justify-between">
          <div className="text-sm text-gray-500">
            {content.split(/\s+/).filter(word => word.length > 0).length} words
          </div>
          
          <div className="flex items-center space-x-2">
            {isEditing && (
              <span className="text-sm text-orange-600">● Unsaved changes</span>
            )}
            <button
              onClick={handleSave}
              disabled={!isEditing}
              className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              💾 Save Changes
            </button>
          </div>
        </div>
      </div>
    </div>
  )
} 