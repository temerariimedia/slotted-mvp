import React, { useState, useCallback } from 'react'
import { ContentEditor } from './ContentEditor'
import { AssetApprovalSystem } from './AssetApprovalSystem'
import { RegenerationAgent } from './RegenerationAgent'

interface Asset {
  id: string
  name: string
  type: 'blog' | 'social' | 'email' | 'script' | 'image' | 'video' | 'audio'
  content: string
  status: 'draft' | 'pending_review' | 'approved' | 'rejected' | 'published'
  createdAt: Date
  updatedAt: Date
  author: string
  reviewer?: string
  reviewComments?: string[]
  version: number
}

interface ContentVersion {
  id: string
  content: string
  timestamp: Date
  author: string
  changes: string
}

export const Phase4Dashboard: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'editor' | 'approval' | 'regeneration'>('editor')
  const [selectedAsset, setSelectedAsset] = useState<Asset | null>(null)
  const [showRegenerationAgent, setShowRegenerationAgent] = useState(false)
  const [userRole, setUserRole] = useState<'author' | 'reviewer' | 'admin'>('author')

  // Mock assets data
  const [assets, setAssets] = useState<Asset[]>([
    {
      id: '1',
      name: 'Q4 Marketing Strategy Blog',
      type: 'blog',
      content: 'This is a comprehensive blog post about Q4 marketing strategies...',
      status: 'pending_review',
      createdAt: new Date('2024-01-15'),
      updatedAt: new Date('2024-01-16'),
      author: 'AI Assistant',
      version: 1
    },
    {
      id: '2',
      name: 'Social Media Campaign Post',
      type: 'social',
      content: 'Exciting news! We\'re launching our new product line...',
      status: 'approved',
      createdAt: new Date('2024-01-14'),
      updatedAt: new Date('2024-01-15'),
      author: 'AI Assistant',
      reviewer: 'Marketing Team',
      version: 2
    },
    {
      id: '3',
      name: 'Email Newsletter Template',
      type: 'email',
      content: 'Dear valued customers, we hope this email finds you well...',
      status: 'draft',
      createdAt: new Date('2024-01-13'),
      updatedAt: new Date('2024-01-13'),
      author: 'AI Assistant',
      version: 1
    }
  ])

  const handleSaveContent = useCallback((content: string, version: ContentVersion) => {
    if (selectedAsset) {
      setAssets(prev => prev.map(asset => 
        asset.id === selectedAsset.id 
          ? {
              ...asset,
              content,
              updatedAt: new Date(),
              version: asset.version + 1,
              status: 'draft'
            }
          : asset
      ))
    }
  }, [selectedAsset])

  const handleApproveAsset = useCallback((assetId: string, comments?: string) => {
    setAssets(prev => prev.map(asset => 
      asset.id === assetId 
        ? {
            ...asset,
            status: 'approved',
            reviewer: userRole === 'admin' ? 'Admin' : 'Reviewer',
            reviewComments: comments ? [...(asset.reviewComments || []), comments] : asset.reviewComments,
            updatedAt: new Date()
          }
        : asset
    ))
  }, [userRole])

  const handleRejectAsset = useCallback((assetId: string, comments: string) => {
    setAssets(prev => prev.map(asset => 
      asset.id === assetId 
        ? {
            ...asset,
            status: 'rejected',
            reviewer: userRole === 'admin' ? 'Admin' : 'Reviewer',
            reviewComments: [...(asset.reviewComments || []), comments],
            updatedAt: new Date()
          }
        : asset
    ))
  }, [userRole])

  const handlePublishAsset = useCallback((assetId: string) => {
    setAssets(prev => prev.map(asset => 
      asset.id === assetId 
        ? {
            ...asset,
            status: 'published',
            updatedAt: new Date()
          }
        : asset
    ))
  }, [])

  const handleEditAsset = useCallback((assetId: string) => {
    const asset = assets.find(a => a.id === assetId)
    if (asset) {
      setSelectedAsset(asset)
      setActiveTab('editor')
    }
  }, [assets])

  const handleRegenerateContent = useCallback(async (prompt: string): Promise<string> => {
    // Simulate AI regeneration
    await new Promise(resolve => setTimeout(resolve, 2000))
    return `[Regenerated content based on: ${prompt}]\n\n${selectedAsset?.content || ''}\n\n[This is a simulated regeneration. In production, this would call your AI provider.]`
  }, [selectedAsset])

  const handleRegenerateWithStyle = useCallback((newContent: string, style: any) => {
    if (selectedAsset) {
      setAssets(prev => prev.map(asset => 
        asset.id === selectedAsset.id 
          ? {
              ...asset,
              content: newContent,
              updatedAt: new Date(),
              version: asset.version + 1,
              status: 'draft'
            }
          : asset
      ))
      setSelectedAsset(prev => prev ? { ...prev, content: newContent } : null)
    }
    setShowRegenerationAgent(false)
  }, [selectedAsset])

  const getTabIcon = (tab: string) => {
    switch (tab) {
      case 'editor': return '✏️'
      case 'approval': return '✅'
      case 'regeneration': return '🔄'
      default: return '📄'
    }
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center space-x-4">
              <h1 className="text-2xl font-bold text-gray-900">Phase 4: Editing & UX Layer</h1>
              <span className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm font-medium">
                Content Management
              </span>
            </div>
            
            <div className="flex items-center space-x-4">
              <select
                value={userRole}
                onChange={(e) => setUserRole(e.target.value as 'author' | 'reviewer' | 'admin')}
                className="px-3 py-1 border border-gray-300 rounded-md text-sm"
              >
                <option value="author">Author</option>
                <option value="reviewer">Reviewer</option>
                <option value="admin">Admin</option>
              </select>
            </div>
          </div>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <nav className="flex space-x-8">
            {[
              { id: 'editor', name: 'Content Editor' },
              { id: 'approval', name: 'Asset Approval' },
              { id: 'regeneration', name: 'Regeneration Agent' }
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`py-4 px-1 border-b-2 font-medium text-sm ${
                  activeTab === tab.id
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                <span className="mr-2">{getTabIcon(tab.id)}</span>
                {tab.name}
              </button>
            ))}
          </nav>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {activeTab === 'editor' && (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-semibold text-gray-900">Content Editor</h2>
              <div className="flex items-center space-x-3">
                <select
                  value={selectedAsset?.id || ''}
                  onChange={(e) => {
                    const asset = assets.find(a => a.id === e.target.value)
                    setSelectedAsset(asset || null)
                  }}
                  className="px-3 py-2 border border-gray-300 rounded-md"
                >
                  <option value="">Select an asset to edit...</option>
                  {assets.map(asset => (
                    <option key={asset.id} value={asset.id}>
                      {asset.name} ({asset.type})
                    </option>
                  ))}
                </select>
                
                {selectedAsset && (
                  <button
                    onClick={() => setShowRegenerationAgent(true)}
                    className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
                  >
                    🔄 Regenerate
                  </button>
                )}
              </div>
            </div>

            {selectedAsset ? (
              <ContentEditor
                initialContent={selectedAsset.content}
                contentType={selectedAsset.type}
                onSave={handleSaveContent}
                onApprove={userRole !== 'author' ? () => handleApproveAsset(selectedAsset.id) : undefined}
                onRegenerate={handleRegenerateContent}
              />
            ) : (
              <div className="bg-white rounded-lg shadow-lg border border-gray-200 p-8 text-center">
                <div className="text-6xl mb-4">📝</div>
                <h3 className="text-lg font-medium text-gray-900 mb-2">No Asset Selected</h3>
                <p className="text-gray-500">Select an asset from the dropdown above to start editing</p>
              </div>
            )}
          </div>
        )}

        {activeTab === 'approval' && (
          <AssetApprovalSystem
            assets={assets}
            onApprove={handleApproveAsset}
            onReject={handleRejectAsset}
            onPublish={handlePublishAsset}
            onEdit={handleEditAsset}
            userRole={userRole}
          />
        )}

        {activeTab === 'regeneration' && (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-semibold text-gray-900">Regeneration Agent</h2>
              <div className="flex items-center space-x-3">
                <select
                  value={selectedAsset?.id || ''}
                  onChange={(e) => {
                    const asset = assets.find(a => a.id === e.target.value)
                    setSelectedAsset(asset || null)
                  }}
                  className="px-3 py-2 border border-gray-300 rounded-md"
                >
                  <option value="">Select content to regenerate...</option>
                  {assets.map(asset => (
                    <option key={asset.id} value={asset.id}>
                      {asset.name} ({asset.type})
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {selectedAsset ? (
              <RegenerationAgent
                originalContent={selectedAsset.content}
                contentType={selectedAsset.type}
                onRegenerate={handleRegenerateWithStyle}
                onCancel={() => setSelectedAsset(null)}
              />
            ) : (
              <div className="bg-white rounded-lg shadow-lg border border-gray-200 p-8 text-center">
                <div className="text-6xl mb-4">🔄</div>
                <h3 className="text-lg font-medium text-gray-900 mb-2">No Content Selected</h3>
                <p className="text-gray-500">Select content from the dropdown above to start regeneration</p>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Regeneration Agent Modal */}
      {showRegenerationAgent && selectedAsset && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            <RegenerationAgent
              originalContent={selectedAsset.content}
              contentType={selectedAsset.type}
              onRegenerate={handleRegenerateWithStyle}
              onCancel={() => setShowRegenerationAgent(false)}
            />
          </div>
        </div>
      )}
    </div>
  )
} 