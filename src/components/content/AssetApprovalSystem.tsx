import React, { useState, useCallback } from 'react'

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

interface AssetApprovalSystemProps {
  assets: Asset[]
  onApprove: (assetId: string, comments?: string) => void
  onReject: (assetId: string, comments: string) => void
  onPublish: (assetId: string) => void
  onEdit: (assetId: string) => void
  userRole: 'author' | 'reviewer' | 'admin'
}

export const AssetApprovalSystem: React.FC<AssetApprovalSystemProps> = ({
  assets,
  onApprove,
  onReject,
  onPublish,
  onEdit,
  userRole
}) => {
  const [selectedAsset, setSelectedAsset] = useState<Asset | null>(null)
  const [filterStatus, setFilterStatus] = useState<Asset['status'] | 'all'>('all')
  const [filterType, setFilterType] = useState<Asset['type'] | 'all'>('all')
  const [reviewComment, setReviewComment] = useState('')
  const [showRejectModal, setShowRejectModal] = useState(false)

  const filteredAssets = assets.filter(asset => {
    const statusMatch = filterStatus === 'all' || asset.status === filterStatus
    const typeMatch = filterType === 'all' || asset.type === filterType
    return statusMatch && typeMatch
  })

  const getStatusColor = (status: Asset['status']) => {
    switch (status) {
      case 'draft': return 'bg-gray-100 text-gray-800'
      case 'pending_review': return 'bg-yellow-100 text-yellow-800'
      case 'approved': return 'bg-green-100 text-green-800'
      case 'rejected': return 'bg-red-100 text-red-800'
      case 'published': return 'bg-blue-100 text-blue-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  const getTypeIcon = (type: Asset['type']) => {
    switch (type) {
      case 'blog': return '📝'
      case 'social': return '📱'
      case 'email': return '📧'
      case 'script': return '🎬'
      case 'image': return '🖼️'
      case 'video': return '🎥'
      case 'audio': return '🎵'
      default: return '📄'
    }
  }

  const handleApprove = useCallback((asset: Asset) => {
    onApprove(asset.id, reviewComment)
    setReviewComment('')
    setSelectedAsset(null)
  }, [onApprove, reviewComment])

  const handleReject = useCallback((asset: Asset) => {
    if (!reviewComment.trim()) {
      alert('Please provide a reason for rejection')
      return
    }
    onReject(asset.id, reviewComment)
    setReviewComment('')
    setShowRejectModal(false)
    setSelectedAsset(null)
  }, [onReject, reviewComment])

  const canReview = userRole === 'reviewer' || userRole === 'admin'
  const canPublish = userRole === 'admin'

  return (
    <div className="bg-white rounded-lg shadow-lg border border-gray-200">
      {/* Header */}
      <div className="p-4 border-b border-gray-200">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-semibold text-gray-900">Asset Approval System</h2>
          <div className="flex items-center space-x-4">
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value as Asset['status'] | 'all')}
              className="px-3 py-1 border border-gray-300 rounded-md text-sm"
            >
              <option value="all">All Status</option>
              <option value="draft">Draft</option>
              <option value="pending_review">Pending Review</option>
              <option value="approved">Approved</option>
              <option value="rejected">Rejected</option>
              <option value="published">Published</option>
            </select>
            
            <select
              value={filterType}
              onChange={(e) => setFilterType(e.target.value as Asset['type'] | 'all')}
              className="px-3 py-1 border border-gray-300 rounded-md text-sm"
            >
              <option value="all">All Types</option>
              <option value="blog">Blog</option>
              <option value="social">Social</option>
              <option value="email">Email</option>
              <option value="script">Script</option>
              <option value="image">Image</option>
              <option value="video">Video</option>
              <option value="audio">Audio</option>
            </select>
          </div>
        </div>
      </div>

      {/* Asset List */}
      <div className="divide-y divide-gray-200">
        {filteredAssets.map((asset) => (
          <div
            key={asset.id}
            className="p-4 hover:bg-gray-50 cursor-pointer"
            onClick={() => setSelectedAsset(asset)}
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <span className="text-2xl">{getTypeIcon(asset.type)}</span>
                <div>
                  <h3 className="font-medium text-gray-900">{asset.name}</h3>
                  <p className="text-sm text-gray-500">
                    Created by {asset.author} • {asset.createdAt.toLocaleDateString()}
                  </p>
                  {asset.reviewer && (
                    <p className="text-xs text-gray-400">
                      Reviewed by {asset.reviewer}
                    </p>
                  )}
                </div>
              </div>
              
              <div className="flex items-center space-x-3">
                <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(asset.status)}`}>
                  {asset.status.replace('_', ' ')}
                </span>
                
                <div className="flex items-center space-x-2">
                  {asset.status === 'pending_review' && canReview && (
                    <>
                      <button
                        onClick={(e) => {
                          e.stopPropagation()
                          handleApprove(asset)
                        }}
                        className="px-3 py-1 text-sm bg-green-600 text-white rounded-md hover:bg-green-700"
                      >
                        ✅ Approve
                      </button>
                      <button
                        onClick={(e) => {
                          e.stopPropagation()
                          setSelectedAsset(asset)
                          setShowRejectModal(true)
                        }}
                        className="px-3 py-1 text-sm bg-red-600 text-white rounded-md hover:bg-red-700"
                      >
                        ❌ Reject
                      </button>
                    </>
                  )}
                  
                  {asset.status === 'approved' && canPublish && (
                    <button
                      onClick={(e) => {
                        e.stopPropagation()
                        onPublish(asset.id)
                      }}
                      className="px-3 py-1 text-sm bg-blue-600 text-white rounded-md hover:bg-blue-700"
                    >
                      🚀 Publish
                    </button>
                  )}
                  
                  <button
                    onClick={(e) => {
                      e.stopPropagation()
                      onEdit(asset.id)
                    }}
                    className="px-3 py-1 text-sm bg-gray-600 text-white rounded-md hover:bg-gray-700"
                  >
                    ✏️ Edit
                  </button>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Asset Detail Modal */}
      {selectedAsset && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-4xl w-full mx-4 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900">
                {selectedAsset.name}
              </h3>
              <button
                onClick={() => setSelectedAsset(null)}
                className="text-gray-400 hover:text-gray-600"
              >
                ✕
              </button>
            </div>
            
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Asset Content */}
              <div>
                <h4 className="font-medium text-gray-900 mb-2">Content Preview</h4>
                <div className="border border-gray-200 rounded-lg p-4 max-h-96 overflow-y-auto">
                  <pre className="whitespace-pre-wrap text-sm text-gray-700">
                    {selectedAsset.content}
                  </pre>
                </div>
              </div>
              
              {/* Asset Metadata */}
              <div>
                <h4 className="font-medium text-gray-900 mb-2">Asset Details</h4>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-500">Type:</span>
                    <span className="font-medium">{selectedAsset.type}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-500">Status:</span>
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(selectedAsset.status)}`}>
                      {selectedAsset.status.replace('_', ' ')}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-500">Version:</span>
                    <span className="font-medium">{selectedAsset.version}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-500">Created:</span>
                    <span className="font-medium">{selectedAsset.createdAt.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-500">Updated:</span>
                    <span className="font-medium">{selectedAsset.updatedAt.toLocaleString()}</span>
                  </div>
                </div>
                
                {/* Review Comments */}
                {selectedAsset.reviewComments && selectedAsset.reviewComments.length > 0 && (
                  <div className="mt-4">
                    <h4 className="font-medium text-gray-900 mb-2">Review Comments</h4>
                    <div className="space-y-2">
                      {selectedAsset.reviewComments.map((comment, index) => (
                        <div key={index} className="bg-gray-50 p-2 rounded text-sm">
                          {comment}
                        </div>
                      ))}
                    </div>
                  </div>
                )}
                
                {/* Review Actions */}
                {selectedAsset.status === 'pending_review' && canReview && (
                  <div className="mt-4 space-y-3">
                    <textarea
                      value={reviewComment}
                      onChange={(e) => setReviewComment(e.target.value)}
                      placeholder="Add review comments (optional)..."
                      className="w-full p-2 border border-gray-300 rounded-md text-sm"
                      rows={3}
                    />
                    <div className="flex space-x-2">
                      <button
                        onClick={() => handleApprove(selectedAsset)}
                        className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700"
                      >
                        ✅ Approve
                      </button>
                      <button
                        onClick={() => setShowRejectModal(true)}
                        className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700"
                      >
                        ❌ Reject
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Reject Modal */}
      {showRejectModal && selectedAsset && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Reject Asset</h3>
            <textarea
              value={reviewComment}
              onChange={(e) => setReviewComment(e.target.value)}
              placeholder="Please provide a reason for rejection..."
              className="w-full p-3 border border-gray-300 rounded-md mb-4"
              rows={4}
              required
            />
            <div className="flex space-x-2">
              <button
                onClick={() => setShowRejectModal(false)}
                className="px-4 py-2 bg-gray-600 text-white rounded-md hover:bg-gray-700"
              >
                Cancel
              </button>
              <button
                onClick={() => handleReject(selectedAsset)}
                className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700"
              >
                Reject
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
} 