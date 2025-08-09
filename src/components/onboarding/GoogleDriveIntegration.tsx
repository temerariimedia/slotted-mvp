/**
 * GoogleDriveIntegration.tsx
 * Step 13: Google Drive and Workspace integration
 * Provides Drive connection, folder structure, file organization, and collaboration setup
 */

import React, { useState, useEffect } from 'react'
import { Button } from '../ui/button'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../ui/card'
import { Tabs, TabsList, TabsTrigger, TabsContent } from '../ui/tabs'
import { Input } from '../ui/input'
import { Badge } from '../ui/badge'
import { ScrollArea } from '../ui/scroll-area'
import { 
  ChevronRight, 
  Folder, 
  MoreVertical, 
  Plus, 
  RefreshCw, 
  Search, 
  FileText, 
  FileImage, 
  FileVideo, 
  FileSpreadsheet, 
  FilePieChart, 
  HelpCircle, 
  ChevronLeft,
  CheckCircle2,
  AlertCircle,
  Link,
  Settings,
  Users,
  Clock,
  Download,
  Upload,
  Share2
} from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import { useSlottedContext } from '../../contexts/SlottedContext'
import { useToast } from '../../hooks/use-toast'

type FolderItem = {
  id: string
  name: string
  type: 'folder'
  children?: FolderItem[]
  expanded?: boolean
  color?: string
}

type FileItem = {
  id: string
  name: string
  type: 'file'
  fileType: 'image' | 'document' | 'spreadsheet' | 'video' | 'report' | 'other'
  modifiedDate: string
  size?: string
  sharedWith?: string[]
}

type BreadcrumbItem = {
  id: string
  name: string
}

type GoogleDriveIntegrationProps = {
  onBack?: () => void
  onNext?: () => void
}

export default function GoogleDriveIntegration({ onBack, onNext }: GoogleDriveIntegrationProps) {
  const { context, updateContext } = useSlottedContext()
  const { toast } = useToast()
  
  const [activeTab, setActiveTab] = useState<'folders' | 'files' | 'settings'>('folders')
  const [searchQuery, setSearchQuery] = useState('')
  const [currentView, setCurrentView] = useState<'root' | 'detail'>('root')
  const [breadcrumbs, setBreadcrumbs] = useState<BreadcrumbItem[]>([
    { id: 'root', name: `SLOTTED_${context.companyInfo?.companyName || context.companyName || 'YourBrand'}` }
  ])
  const [selectedFolder, setSelectedFolder] = useState<FolderItem | null>(null)
  const [isConnecting, setIsConnecting] = useState(false)
  const [isConnected, setIsConnected] = useState(false)
  const [syncStatus, setSyncStatus] = useState<'idle' | 'syncing' | 'success' | 'error'>('idle')

  // Load existing Google Drive configuration
  useEffect(() => {
    if (context.googleDriveIntegration) {
      setIsConnected(context.googleDriveIntegration.connected || false)
      setSyncStatus(context.googleDriveIntegration.syncStatus || 'idle')
    }
  }, [context.googleDriveIntegration])

  // Root level folders (months) - initial view
  const rootFolders: FolderItem[] = [
    { id: '1', name: '1. Jan', type: 'folder', color: 'blue' },
    { id: '2', name: '2. Feb', type: 'folder', color: 'purple' },
    { id: '3', name: '3. March', type: 'folder', color: 'green' },
    { id: '4', name: '4. April', type: 'folder', color: 'yellow' },
    { id: '5', name: '5. May', type: 'folder', color: 'pink' },
    { id: '6', name: '6. June', type: 'folder', color: 'cyan' },
    { id: '7', name: '7. July', type: 'folder', color: 'orange' },
    { id: '8', name: '8. Aug', type: 'folder', color: 'red' },
    { id: '9', name: '9. Sept', type: 'folder', color: 'indigo' },
    { id: '10', name: '10. Oct', type: 'folder', color: 'amber' },
    { id: '11', name: '11. Nov', type: 'folder', color: 'emerald' },
    { id: '12', name: '12. Dec', type: 'folder', color: 'rose' },
  ]
  
  // Month subfolder structure - used when clicking into a month folder
  const subfolderStructure: FolderItem[] = [
    { 
      id: 'calendar', 
      name: '00_Calendar_Apr/2025', 
      type: 'folder',
      color: 'yellow',
      children: [
        { id: 'cal-1', name: 'Monthly Overview', type: 'folder' },
        { id: 'cal-2', name: 'Weekly Plans', type: 'folder' },
        { id: 'cal-3', name: 'Key Dates', type: 'folder' },
      ]
    },
    { 
      id: 'campaigns', 
      name: '01_Campaigns', 
      type: 'folder',
      color: 'blue',
      children: [
        { id: 'camp-1', name: 'Spring Sale Campaign', type: 'folder' },
        { id: 'camp-2', name: 'Earth Day Campaign', type: 'folder' },
        { id: 'camp-3', name: 'Month-End Promo', type: 'folder' },
      ]
    },
    { 
      id: 'asset-types', 
      name: '02_Asset Types', 
      type: 'folder',
      color: 'green',
      children: [
        { id: 'asset-1', name: 'Social Media Assets', type: 'folder' },
        { id: 'asset-2', name: 'Email Templates', type: 'folder' },
        { id: 'asset-3', name: 'Blog Content', type: 'folder' },
        { id: 'asset-4', name: 'Videos', type: 'folder' },
        { id: 'asset-5', name: 'Images', type: 'folder' },
      ]
    },
    { 
      id: 'performance', 
      name: '03_Performance Reports', 
      type: 'folder',
      color: 'purple',
      children: [
        { id: 'perf-1', name: 'Weekly Analytics', type: 'folder' },
        { id: 'perf-2', name: 'Campaign Results', type: 'folder' },
        { id: 'perf-3', name: 'Channel Performance', type: 'folder' },
      ]
    },
  ]

  // Sample recent files
  const recentFiles: FileItem[] = [
    {
      id: 'file-1',
      name: 'Spring Sale Banner.png',
      type: 'file',
      fileType: 'image',
      modifiedDate: 'yesterday',
      size: '2.4 MB',
      sharedWith: ['team@company.com']
    },
    {
      id: 'file-2',
      name: 'Earth Day Blog Post.docx',
      type: 'file',
      fileType: 'document',
      modifiedDate: '2 days ago',
      size: '145 KB',
      sharedWith: ['content@company.com']
    },
    {
      id: 'file-3',
      name: 'Marketing Calendar - April 2025.xlsx',
      type: 'file',
      fileType: 'spreadsheet',
      modifiedDate: '3 days ago',
      size: '890 KB',
      sharedWith: ['marketing@company.com', 'management@company.com']
    },
    {
      id: 'file-4',
      name: 'Product Demo Video.mp4',
      type: 'file',
      fileType: 'video',
      modifiedDate: '5 days ago',
      size: '45.2 MB',
      sharedWith: ['sales@company.com']
    },
    {
      id: 'file-5',
      name: 'Q1 Marketing Performance Report.pdf',
      type: 'file',
      fileType: 'report',
      modifiedDate: '1 week ago',
      size: '1.2 MB',
      sharedWith: ['executives@company.com']
    }
  ]

  const handleFolderClick = (folder: FolderItem) => {
    if (currentView === 'root') {
      setSelectedFolder(folder)
      setCurrentView('detail')
      setBreadcrumbs([...breadcrumbs, { id: folder.id, name: folder.name }])
    } else if (folder.children) {
      // Toggle expanded state for folders with children
      const updatedFolder = { ...folder, expanded: !folder.expanded }
      setSelectedFolder(updatedFolder)
    } else {
      // Navigate into a folder without children (would show files in real implementation)
      setBreadcrumbs([...breadcrumbs, { id: folder.id, name: folder.name }])
    }
  }

  const handleBreadcrumbClick = (index: number) => {
    if (index === 0) {
      // Return to root view
      setCurrentView('root')
      setBreadcrumbs([breadcrumbs[0]])
      setSelectedFolder(null)
    } else {
      // Navigate to a specific level in the breadcrumb
      setBreadcrumbs(breadcrumbs.slice(0, index + 1))
      if (index === 1) {
        // If clicking the second breadcrumb, show the month subfolders
        setCurrentView('detail')
      }
    }
  }

  const renderFolderIcon = (name: string, color?: string) => {
    const colorClass = color ? `text-${color}-500` : 'text-gray-500'
    return <Folder className={`h-5 w-5 ${colorClass}`} />
  }

  const getFileIcon = (fileType: FileItem['fileType']) => {
    switch (fileType) {
      case 'image': return <FileImage className="h-5 w-5 text-blue-500" />
      case 'document': return <FileText className="h-5 w-5 text-green-500" />
      case 'spreadsheet': return <FileSpreadsheet className="h-5 w-5 text-green-600" />
      case 'video': return <FileVideo className="h-5 w-5 text-red-500" />
      case 'report': return <FilePieChart className="h-5 w-5 text-purple-500" />
      default: return <FileText className="h-5 w-5 text-gray-500" />
    }
  }

  const getFileTypeBadge = (fileType: FileItem['fileType']) => {
    const badgeConfig = {
      image: { label: 'Image', variant: 'default' as const },
      document: { label: 'Document', variant: 'secondary' as const },
      spreadsheet: { label: 'Spreadsheet', variant: 'outline' as const },
      video: { label: 'Video', variant: 'destructive' as const },
      report: { label: 'Report', variant: 'default' as const },
      other: { label: 'File', variant: 'secondary' as const }
    }
    
    const config = badgeConfig[fileType]
    return <Badge variant={config.variant}>{config.label}</Badge>
  }

  const handleConnectDrive = async () => {
    setIsConnecting(true)
    setSyncStatus('syncing')

    try {
      // Simulate Google Drive connection
      await new Promise(resolve => setTimeout(resolve, 2000))

      // Update context with Google Drive integration
      updateContext({
        googleDriveIntegration: {
          connected: true,
          accountEmail: 'user@company.com',
          rootFolderId: 'mock-folder-id',
          folderStructure: rootFolders,
          syncStatus: 'success',
          lastSyncAt: new Date().toISOString(),
          permissions: ['read', 'write', 'share'],
          collaborators: ['team@company.com']
        }
      })

      setIsConnected(true)
      setSyncStatus('success')
      
      toast({
        title: 'Google Drive Connected!',
        description: 'Your SLOTTED workspace has been set up in Google Drive with organized folder structure.'
      })
    } catch (error) {
      setSyncStatus('error')
      toast({
        title: 'Connection Failed',
        description: 'Unable to connect to Google Drive. Please try again.',
        variant: 'destructive'
      })
    } finally {
      setIsConnecting(false)
    }
  }

  const handleCreateFolder = () => {
    toast({
      title: 'Folder Created',
      description: 'New folder has been created in your Google Drive workspace.'
    })
  }

  const handleSyncFiles = async () => {
    setSyncStatus('syncing')
    
    try {
      await new Promise(resolve => setTimeout(resolve, 1500))
      setSyncStatus('success')
      
      toast({
        title: 'Files Synchronized',
        description: 'All files have been synchronized with Google Drive.'
      })
    } catch (error) {
      setSyncStatus('error')
      toast({
        title: 'Sync Failed',
        description: 'Unable to synchronize files. Please try again.',
        variant: 'destructive'
      })
    }
  }

  const getSyncStatusIcon = () => {
    switch (syncStatus) {
      case 'syncing': return <RefreshCw className="h-4 w-4 animate-spin text-blue-500" />
      case 'success': return <CheckCircle2 className="h-4 w-4 text-green-500" />
      case 'error': return <AlertCircle className="h-4 w-4 text-red-500" />
      default: return <Clock className="h-4 w-4 text-gray-500" />
    }
  }

  const handleComplete = () => {
    // Mark Google Drive integration as complete
    updateContext({
      googleDriveIntegration: {
        ...context.googleDriveIntegration,
        completed: true,
        completedAt: new Date().toISOString()
      },
      currentPhase: 'complete'
    })

    toast({
      title: 'Google Drive Setup Complete!',
      description: 'Your workspace is ready for seamless collaboration and file management.'
    })

    if (onNext) {
      onNext()
    }
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="space-y-6"
    >
      {/* Header */}
      <div className="text-center">
        <h2 className="text-3xl font-bold text-gray-900 mb-2">Google Drive Integration</h2>
        <p className="text-lg text-gray-600 mb-6">
          Manage your SLOTTED marketing assets in Google Drive with organized folder structure
        </p>
      </div>

      {/* Navigation */}
      <div className="flex items-center justify-between mb-4">
        {onBack && (
          <Button 
            variant="outline" 
            size="sm" 
            onClick={onBack}
          >
            <ChevronLeft className="h-4 w-4 mr-1" />
            Back
          </Button>
        )}
        
        <div className="flex items-center space-x-2">
          {getSyncStatusIcon()}
          <span className="text-sm text-gray-600">
            {syncStatus === 'syncing' && 'Syncing...'}
            {syncStatus === 'success' && 'All files synchronized'}
            {syncStatus === 'error' && 'Sync failed'}
            {syncStatus === 'idle' && 'Ready to sync'}
          </span>
        </div>
      </div>

      {/* Connection Status */}
      {!isConnected ? (
        <Card className="border-dashed border-2 border-gray-300">
          <CardContent className="text-center py-8">
            <div className="flex flex-col items-center space-y-4">
              <div className="p-3 bg-blue-100 rounded-full">
                <Link className="h-8 w-8 text-blue-600" />
              </div>
              <div>
                <h3 className="text-lg font-semibold mb-2">Connect to Google Drive</h3>
                <p className="text-gray-600 mb-4 max-w-md">
                  Connect your Google Drive to automatically organize your marketing assets 
                  with our structured folder system.
                </p>
              </div>
              <Button
                onClick={handleConnectDrive}
                disabled={isConnecting}
                size="lg"
                className="bg-blue-600 hover:bg-blue-700"
              >
                {isConnecting ? (
                  <>
                    <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                    Connecting...
                  </>
                ) : (
                  <>
                    <Link className="h-4 w-4 mr-2" />
                    Connect Google Drive
                  </>
                )}
              </Button>
            </div>
          </CardContent>
        </Card>
      ) : (
        <>
          {/* Breadcrumb Navigation */}
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-1 text-sm text-gray-600">
              {breadcrumbs.map((item, index) => (
                <div key={item.id} className="flex items-center">
                  {index > 0 && <ChevronRight className="h-4 w-4 mx-1 text-gray-400" />}
                  <button 
                    className={`hover:text-blue-600 transition-colors ${index === breadcrumbs.length - 1 ? 'font-medium text-gray-900' : 'hover:underline'}`}
                    onClick={() => handleBreadcrumbClick(index)}
                  >
                    {item.name}
                  </button>
                </div>
              ))}
            </div>
            
            <div className="flex items-center space-x-2">
              <div className="relative w-64">
                <Search className="absolute left-2 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input 
                  type="search" 
                  placeholder="Search files and folders" 
                  className="pl-8 pr-4 h-9"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
              <Button 
                size="sm" 
                variant="outline" 
                onClick={handleSyncFiles}
                disabled={syncStatus === 'syncing'}
              >
                <RefreshCw className={`h-4 w-4 mr-2 ${syncStatus === 'syncing' ? 'animate-spin' : ''}`} />
                Sync
              </Button>
            </div>
          </div>

          {/* Main Content */}
          <Tabs value={activeTab} onValueChange={(value) => setActiveTab(value as any)}>
            <TabsList className="mb-4">
              <TabsTrigger value="folders">Folders</TabsTrigger>
              <TabsTrigger value="files">Recent Files</TabsTrigger>
              <TabsTrigger value="settings">Settings</TabsTrigger>
            </TabsList>
            
            <TabsContent value="folders">
              <Card>
                <CardContent className="p-0">
                  <div className="rounded-md overflow-hidden border border-gray-200">
                    <div className="flex items-center justify-between bg-gray-50 p-3 border-b border-gray-200">
                      <div className="flex items-center space-x-2">
                        <span className="font-medium text-sm">Folder Structure</span>
                      </div>
                      <Button size="sm" variant="outline" className="h-8" onClick={handleCreateFolder}>
                        <Plus className="h-4 w-4 mr-2" />
                        New Folder
                      </Button>
                    </div>
                    
                    <ScrollArea className="h-[450px]">
                      {currentView === 'root' ? (
                        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 p-4">
                          {rootFolders.map((folder) => (
                            <motion.div
                              key={folder.id}
                              whileHover={{ scale: 1.02 }}
                              whileTap={{ scale: 0.98 }}
                              className="relative flex flex-col items-center justify-center p-4 border border-gray-200 rounded-lg hover:bg-blue-50 cursor-pointer transition-colors"
                              onClick={() => handleFolderClick(folder)}
                            >
                              {renderFolderIcon(folder.name, folder.color)}
                              <Folder className={`h-16 w-16 text-${folder.color}-500 mb-2`} />
                              <span className="text-sm font-medium text-center">{folder.name}</span>
                              <button className="absolute top-2 right-2 text-gray-400 hover:text-gray-700">
                                <MoreVertical className="h-4 w-4" />
                              </button>
                            </motion.div>
                          ))}
                        </div>
                      ) : (
                        <div className="divide-y divide-gray-200">
                          {subfolderStructure.map((folder) => (
                            <div key={folder.id}>
                              <div 
                                className="flex items-center justify-between p-3 hover:bg-gray-50 cursor-pointer transition-colors"
                                onClick={() => handleFolderClick(folder)}
                              >
                                <div className="flex items-center space-x-3">
                                  {renderFolderIcon(folder.name, folder.color)}
                                  <span className="text-sm font-medium">{folder.name}</span>
                                </div>
                                <div className="flex items-center space-x-2">
                                  <Share2 className="h-4 w-4 text-gray-400" />
                                  <button className="text-gray-400 hover:text-gray-700">
                                    <MoreVertical className="h-4 w-4" />
                                  </button>
                                </div>
                              </div>
                              
                              {/* Show children if expanded */}
                              <AnimatePresence>
                                {folder.expanded && folder.children && (
                                  <motion.div
                                    initial={{ height: 0, opacity: 0 }}
                                    animate={{ height: 'auto', opacity: 1 }}
                                    exit={{ height: 0, opacity: 0 }}
                                    className="pl-8 bg-gray-50"
                                  >
                                    {folder.children.map((child) => (
                                      <div 
                                        key={child.id}
                                        className="flex items-center justify-between p-3 border-t border-gray-200 hover:bg-gray-100 cursor-pointer transition-colors"
                                        onClick={(e) => {
                                          e.stopPropagation()
                                          handleFolderClick(child)
                                        }}
                                      >
                                        <div className="flex items-center space-x-3">
                                          {renderFolderIcon(child.name)}
                                          <span className="text-sm">{child.name}</span>
                                        </div>
                                        <div className="flex items-center space-x-2">
                                          <button 
                                            className="text-gray-400 hover:text-gray-700"
                                            onClick={(e) => e.stopPropagation()}
                                          >
                                            <MoreVertical className="h-4 w-4" />
                                          </button>
                                        </div>
                                      </div>
                                    ))}
                                  </motion.div>
                                )}
                              </AnimatePresence>
                            </div>
                          ))}
                        </div>
                      )}
                    </ScrollArea>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
            
            <TabsContent value="files">
              <Card>
                <CardContent className="p-4">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-lg font-semibold">Recent Files</h3>
                    <div className="flex space-x-2">
                      <Button variant="outline" size="sm">
                        <Upload className="h-4 w-4 mr-2" />
                        Upload
                      </Button>
                      <Button variant="outline" size="sm">View All Files</Button>
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    {recentFiles.map((file) => (
                      <motion.div
                        key={file.id}
                        whileHover={{ backgroundColor: 'rgb(249, 250, 251)' }}
                        className="flex items-center justify-between p-3 border rounded-md cursor-pointer transition-colors"
                      >
                        <div className="flex items-center space-x-3">
                          {getFileIcon(file.fileType)}
                          <div className="flex-1">
                            <div className="text-sm font-medium">{file.name}</div>
                            <div className="text-xs text-gray-500 flex items-center space-x-3">
                              <span>Modified {file.modifiedDate}</span>
                              <span>•</span>
                              <span>{file.size}</span>
                              {file.sharedWith && file.sharedWith.length > 0 && (
                                <>
                                  <span>•</span>
                                  <div className="flex items-center space-x-1">
                                    <Users className="h-3 w-3" />
                                    <span>{file.sharedWith.length} collaborators</span>
                                  </div>
                                </>
                              )}
                            </div>
                          </div>
                        </div>
                        <div className="flex items-center space-x-2">
                          {getFileTypeBadge(file.fileType)}
                          <Button variant="ghost" size="sm">
                            <Download className="h-4 w-4" />
                          </Button>
                        </div>
                      </motion.div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="settings">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <Settings className="h-5 w-5" />
                    <span>Google Drive Settings</span>
                  </CardTitle>
                  <CardDescription>
                    Configure your Google Drive integration and collaboration settings
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  {/* Account Information */}
                  <div>
                    <h4 className="font-semibold mb-3">Connected Account</h4>
                    <div className="flex items-center justify-between p-3 bg-green-50 border border-green-200 rounded-md">
                      <div className="flex items-center space-x-3">
                        <CheckCircle2 className="h-5 w-5 text-green-600" />
                        <div>
                          <div className="font-medium">user@company.com</div>
                          <div className="text-sm text-gray-600">Connected and synchronized</div>
                        </div>
                      </div>
                      <Button variant="outline" size="sm">Disconnect</Button>
                    </div>
                  </div>

                  {/* Sync Settings */}
                  <div>
                    <h4 className="font-semibold mb-3">Synchronization</h4>
                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <span className="text-sm">Auto-sync files</span>
                        <input type="checkbox" defaultChecked className="toggle" />
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-sm">Sync frequency</span>
                        <select className="text-sm border rounded px-2 py-1">
                          <option>Real-time</option>
                          <option>Every 5 minutes</option>
                          <option>Every 15 minutes</option>
                          <option>Manual only</option>
                        </select>
                      </div>
                    </div>
                  </div>

                  {/* Collaboration */}
                  <div>
                    <h4 className="font-semibold mb-3">Collaboration</h4>
                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <span className="text-sm">Default sharing permissions</span>
                        <select className="text-sm border rounded px-2 py-1">
                          <option>View only</option>
                          <option>Comment</option>
                          <option>Edit</option>
                        </select>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-sm">Team folder access</span>
                        <input type="checkbox" defaultChecked className="toggle" />
                      </div>
                    </div>
                  </div>

                  {/* Storage */}
                  <div>
                    <h4 className="font-semibold mb-3">Storage Usage</h4>
                    <div className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span>Used Storage</span>
                        <span>2.4 GB of 15 GB</span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div className="bg-blue-600 h-2 rounded-full" style={{ width: '16%' }}></div>
                      </div>
                      <div className="text-xs text-gray-500">
                        SLOTTED workspace is using 2.4 GB of your Google Drive storage
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </>
      )}

      {/* Help Section */}
      <div className="flex items-center justify-between text-sm text-gray-500 bg-gray-50 p-4 rounded-lg">
        <div className="flex items-center">
          <HelpCircle className="h-4 w-4 mr-2" />
          All files are synchronized with Google Drive in real-time
        </div>
        
        {isConnected && (
          <div className="flex space-x-2">
            <Button variant="outline" size="sm">
              <Plus className="h-4 w-4 mr-2" />
              New File
            </Button>
          </div>
        )}
      </div>

      {/* Action Buttons */}
      <div className="flex justify-between">
        <div />
        <Button 
          onClick={handleComplete}
          disabled={!isConnected}
          size="lg"
          className="bg-green-600 hover:bg-green-700"
        >
          Complete Setup
          <ChevronRight className="h-4 w-4 ml-2" />
        </Button>
      </div>
    </motion.div>
  )
}