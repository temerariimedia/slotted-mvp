import React, { useState } from 'react'
import { BlogContentGeneratorComponent } from '../mvp3/BlogContentGenerator'
import { ScriptGenerator } from './ScriptGenerator'
import { EmailGenerator } from './EmailGenerator'
import { SocialMediaGenerator } from './SocialMediaGenerator'
import { useSlottedContext } from '../../contexts/SlottedContext'

interface GeneratedContent {
  type: 'blog' | 'script' | 'email' | 'social'
  title: string
  content: any
  timestamp: string
}

export const Phase3Dashboard: React.FC = () => {
  const { context } = useSlottedContext()
  const [activeTab, setActiveTab] = useState<'blog' | 'script' | 'email' | 'social'>('blog')
  const [generatedContent, setGeneratedContent] = useState<GeneratedContent[]>([])
  const [sharedTopic, setSharedTopic] = useState('')

  const handleContentGenerated = (type: 'blog' | 'script' | 'email' | 'social', content: any) => {
    const newContent: GeneratedContent = {
      type,
      title: getContentTitle(type, content),
      content,
      timestamp: new Date().toISOString()
    }
    
    setGeneratedContent(prev => [newContent, ...prev])
  }

  const getContentTitle = (type: string, content: any): string => {
    switch (type) {
      case 'blog':
        return content.title || 'Blog Post'
      case 'script':
        return content.title || 'Video Script'
      case 'email':
        return content.subject || 'Email Campaign'
      case 'social':
        return `Social Posts (${Object.keys(content).length} platforms)`
      default:
        return 'Generated Content'
    }
  }

  const getContentIcon = (type: string): string => {
    switch (type) {
      case 'blog': return '📝'
      case 'script': return '🎬'
      case 'email': return '📧'
      case 'social': return '📱'
      default: return '📄'
    }
  }

  const getTabIcon = (tab: string): string => {
    switch (tab) {
      case 'blog': return '📝'
      case 'script': return '🎬'
      case 'email': return '📧'
      case 'social': return '📱'
      default: return '📄'
    }
  }

  const tabs = [
    { id: 'blog', name: 'Blog Generator', icon: '📝' },
    { id: 'script', name: 'Script Generator', icon: '🎬' },
    { id: 'email', name: 'Email Generator', icon: '📧' },
    { id: 'social', name: 'Social Media', icon: '📱' }
  ]

  if (!context) {
    return (
      <div className="max-w-6xl mx-auto p-6">
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-6 text-center">
          <h2 className="text-xl font-semibold text-yellow-900 mb-2">Setup Required</h2>
          <p className="text-yellow-800">
            Please complete the onboarding process to access the content generation tools.
          </p>
        </div>
      </div>
    )
  }

  return (
    <div className="max-w-7xl mx-auto p-6">
      {/* Header */}
      <div className="mb-8">
        <div className="text-center">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">🎯 Phase 3: Content Pipeline</h1>
          <p className="text-xl text-gray-600 mb-6">
            Generate comprehensive marketing content with AI-powered tools
          </p>
        </div>

        {/* Company Context */}
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-6 mb-6">
          <h3 className="text-lg font-semibold text-blue-900 mb-3">
            🧬 Using Company DNA: {context.companyName}
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 text-sm">
            <div>
              <span className="font-medium text-blue-800">Industry:</span>
              <span className="ml-2 text-blue-700">{context.industry}</span>
            </div>
            <div>
              <span className="font-medium text-blue-800">Brand Voice:</span>
              <span className="ml-2 text-blue-700">{context.brandVoice}</span>
            </div>
            <div>
              <span className="font-medium text-blue-800">Target Audience:</span>
              <span className="ml-2 text-blue-700">{context.targetAudience}</span>
            </div>
            <div>
              <span className="font-medium text-blue-800">Generated Content:</span>
              <span className="ml-2 text-blue-700">{generatedContent.length} items</span>
            </div>
          </div>
        </div>

        {/* Shared Topic Input */}
        <div className="bg-gray-50 border border-gray-200 rounded-lg p-4 mb-6">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            🎯 Shared Topic (Optional - will be used across all generators)
          </label>
          <input
            type="text"
            value={sharedTopic}
            onChange={(e) => setSharedTopic(e.target.value)}
            placeholder="Enter a topic to use across all content generators..."
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Sidebar - Generated Content History */}
        <div className="lg:col-span-1">
          <div className="bg-white rounded-lg shadow-lg border border-gray-200 p-4">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">📚 Generated Content</h3>
            
            {generatedContent.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                <span className="text-2xl mb-2 block">📄</span>
                <p>No content generated yet</p>
                <p className="text-sm">Start by generating content using the tools below</p>
              </div>
            ) : (
              <div className="space-y-3 max-h-96 overflow-y-auto">
                {generatedContent.map((item, index) => (
                  <div
                    key={index}
                    className="p-3 bg-gray-50 rounded-lg border border-gray-200 hover:bg-gray-100 cursor-pointer transition-colors"
                    onClick={() => {
                      // Could implement content preview here
                      console.log('View content:', item)
                    }}
                  >
                    <div className="flex items-center space-x-2 mb-1">
                      <span className="text-lg">{getContentIcon(item.type)}</span>
                      <span className="text-xs text-gray-500 uppercase">{item.type}</span>
                    </div>
                    <h4 className="font-medium text-gray-900 text-sm truncate">
                      {item.title}
                    </h4>
                    <p className="text-xs text-gray-500">
                      {new Date(item.timestamp).toLocaleString()}
                    </p>
                  </div>
                ))}
              </div>
            )}

            {generatedContent.length > 0 && (
              <div className="mt-4 pt-4 border-t border-gray-200">
                <button
                  onClick={() => setGeneratedContent([])}
                  className="w-full px-3 py-2 text-sm bg-red-600 text-white rounded-md hover:bg-red-700"
                >
                  Clear History
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Main Content Area */}
        <div className="lg:col-span-3">
          {/* Tab Navigation */}
          <div className="bg-white rounded-lg shadow-lg border border-gray-200 mb-6">
            <div className="border-b border-gray-200">
              <nav className="flex space-x-8 px-6">
                {tabs.map((tab) => (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id as any)}
                    className={`py-4 px-1 border-b-2 font-medium text-sm transition-colors ${
                      activeTab === tab.id
                        ? 'border-blue-500 text-blue-600'
                        : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                    }`}
                  >
                    <span className="mr-2">{tab.icon}</span>
                    {tab.name}
                  </button>
                ))}
              </nav>
            </div>

            {/* Tab Content */}
            <div className="p-6">
              {activeTab === 'blog' && (
                <BlogContentGeneratorComponent
                  companyDNA={context}
                  topic={sharedTopic}
                  onBlogGenerated={(blog) => handleContentGenerated('blog', blog)}
                />
              )}

              {activeTab === 'script' && (
                <ScriptGenerator
                  topic={sharedTopic}
                  onScriptGenerated={(script) => handleContentGenerated('script', script)}
                />
              )}

              {activeTab === 'email' && (
                <EmailGenerator
                  topic={sharedTopic}
                  onEmailGenerated={(email) => handleContentGenerated('email', email)}
                />
              )}

              {activeTab === 'social' && (
                <SocialMediaGenerator
                  topic={sharedTopic}
                  onPostsGenerated={(posts) => handleContentGenerated('social', posts)}
                />
              )}
            </div>
          </div>

          {/* Quick Actions */}
          <div className="bg-white rounded-lg shadow-lg border border-gray-200 p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">⚡ Quick Actions</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <button
                onClick={() => setActiveTab('blog')}
                className="p-4 bg-blue-50 border border-blue-200 rounded-lg hover:bg-blue-100 transition-colors"
              >
                <div className="text-center">
                  <span className="text-2xl block mb-2">📝</span>
                  <span className="font-medium text-blue-900">Blog Post</span>
                  <p className="text-sm text-blue-700 mt-1">2000+ word articles</p>
                </div>
              </button>

              <button
                onClick={() => setActiveTab('script')}
                className="p-4 bg-purple-50 border border-purple-200 rounded-lg hover:bg-purple-100 transition-colors"
              >
                <div className="text-center">
                  <span className="text-2xl block mb-2">🎬</span>
                  <span className="font-medium text-purple-900">Video Script</span>
                  <p className="text-sm text-purple-700 mt-1">3-5 minute videos</p>
                </div>
              </button>

              <button
                onClick={() => setActiveTab('email')}
                className="p-4 bg-green-50 border border-green-200 rounded-lg hover:bg-green-100 transition-colors"
              >
                <div className="text-center">
                  <span className="text-2xl block mb-2">📧</span>
                  <span className="font-medium text-green-900">Email Campaign</span>
                  <p className="text-sm text-green-700 mt-1">Newsletters & promotions</p>
                </div>
              </button>

              <button
                onClick={() => setActiveTab('social')}
                className="p-4 bg-orange-50 border border-orange-200 rounded-lg hover:bg-orange-100 transition-colors"
              >
                <div className="text-center">
                  <span className="text-2xl block mb-2">📱</span>
                  <span className="font-medium text-orange-900">Social Media</span>
                  <p className="text-sm text-orange-700 mt-1">Multi-platform posts</p>
                </div>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Footer Stats */}
      <div className="mt-8 bg-white rounded-lg shadow-lg border border-gray-200 p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">📊 Content Generation Stats</h3>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="text-center p-4 bg-blue-50 rounded-lg">
            <div className="text-2xl font-bold text-blue-600">
              {generatedContent.filter(c => c.type === 'blog').length}
            </div>
            <div className="text-sm text-blue-800">Blog Posts</div>
          </div>
          <div className="text-center p-4 bg-purple-50 rounded-lg">
            <div className="text-2xl font-bold text-purple-600">
              {generatedContent.filter(c => c.type === 'script').length}
            </div>
            <div className="text-sm text-purple-800">Video Scripts</div>
          </div>
          <div className="text-center p-4 bg-green-50 rounded-lg">
            <div className="text-2xl font-bold text-green-600">
              {generatedContent.filter(c => c.type === 'email').length}
            </div>
            <div className="text-sm text-green-800">Email Campaigns</div>
          </div>
          <div className="text-center p-4 bg-orange-50 rounded-lg">
            <div className="text-2xl font-bold text-orange-600">
              {generatedContent.filter(c => c.type === 'social').length}
            </div>
            <div className="text-sm text-orange-800">Social Media Sets</div>
          </div>
        </div>
      </div>
    </div>
  )
} 