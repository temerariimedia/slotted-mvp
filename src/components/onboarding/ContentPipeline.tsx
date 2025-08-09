/**
 * ContentPipeline.tsx
 * Step 14: Content generation pipeline configuration
 * Provides pipeline setup, content workflows, generation rules, and quality control
 */

import React, { useState, useEffect } from 'react'
import { Button } from '../ui/button'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../ui/card'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select'
import { Checkbox } from '../ui/checkbox'
import { Label } from '../ui/label'
import { Badge } from '../ui/badge'
import { Avatar, AvatarImage, AvatarFallback } from '../ui/avatar'
import { Input } from '../ui/input'
import { Textarea } from '../ui/textarea'
import { Tabs, TabsList, TabsTrigger, TabsContent } from '../ui/tabs'
import { 
  PlusCircle, 
  Calendar, 
  MoreVertical, 
  Settings, 
  Zap, 
  Clock, 
  CheckCircle2, 
  AlertCircle, 
  Users, 
  Bot, 
  FileText, 
  Image, 
  Video, 
  Mail, 
  MessageSquare,
  ChevronLeft,
  ChevronRight,
  RefreshCw,
  Play,
  Pause,
  Filter,
  Download,
  Upload,
  Share2
} from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import { useSlottedContext } from '../../contexts/SlottedContext'
import { useToast } from '../../hooks/use-toast'

type ContentType = 'blog' | 'instagram' | 'facebook' | 'twitter' | 'linkedin' | 'email' | 'video' | 'image'

type ContentStage = 'ideas' | 'progress' | 'review' | 'scheduled' | 'published'

type AssigneeType = 'user' | 'ai' | 'team'

type ContentItem = {
  id: string
  title: string
  description: string
  type: ContentType
  stage: ContentStage
  scheduledDate?: string
  publishDate?: string
  assignee: string
  assigneeType: AssigneeType
  priority: 'low' | 'medium' | 'high'
  campaign?: string
  tags: string[]
  aiGenerated: boolean
  wordCount?: number
  estimatedReadTime?: number
  approvals: string[]
  comments: number
}

type PipelineRule = {
  id: string
  name: string
  description: string
  contentType: ContentType[]
  trigger: 'schedule' | 'manual' | 'approval' | 'campaign'
  actions: string[]
  enabled: boolean
}

type QualityCheck = {
  id: string
  name: string
  description: string
  type: 'grammar' | 'brand' | 'seo' | 'readability' | 'tone'
  enabled: boolean
  threshold?: number
}

interface ContentPipelineProps {
  onBack?: () => void
  onNext?: () => void
}

export default function ContentPipeline({ onBack, onNext }: ContentPipelineProps) {
  const { context, updateContext } = useSlottedContext()
  const { toast } = useToast()
  
  const [activeTab, setActiveTab] = useState<'pipeline' | 'rules' | 'quality'>('pipeline')
  const [selectedCampaign, setSelectedCampaign] = useState('all')
  const [selectedContentType, setSelectedContentType] = useState('all')
  const [showCompleted, setShowCompleted] = useState(false)
  const [isGenerating, setIsGenerating] = useState(false)
  const [pipelineStatus, setPipelineStatus] = useState<'idle' | 'running' | 'paused'>('idle')

  // Sample content items with enhanced data
  const [contentItems, setContentItems] = useState<ContentItem[]>([
    {
      id: '1',
      title: "AI-Powered Marketing Strategy Guide",
      description: "Comprehensive guide on implementing AI in marketing workflows",
      type: "blog",
      stage: "ideas",
      assignee: "AI Assistant",
      assigneeType: "ai",
      priority: "high",
      campaign: "AI Marketing Series",
      tags: ["AI", "Marketing", "Strategy"],
      aiGenerated: true,
      comments: 0,
      approvals: []
    },
    {
      id: '2',
      title: "Customer Success Stories Carousel",
      description: "Visual showcase of 5 customer testimonials with results",
      type: "instagram",
      stage: "progress",
      scheduledDate: "2025-01-15",
      assignee: "Content Team",
      assigneeType: "team",
      priority: "medium",
      campaign: "Social Proof Campaign",
      tags: ["Testimonials", "Social Proof", "Success"],
      aiGenerated: false,
      comments: 3,
      approvals: ["manager@company.com"]
    },
    {
      id: '3',
      title: "Product Launch Email Series",
      description: "3-part email sequence for new feature announcement",
      type: "email",
      stage: "review",
      scheduledDate: "2025-01-20",
      assignee: "Marketing Lead",
      assigneeType: "user",
      priority: "high",
      campaign: "Feature Launch",
      tags: ["Product Launch", "Email Marketing", "Features"],
      aiGenerated: true,
      wordCount: 1200,
      comments: 2,
      approvals: ["ceo@company.com", "marketing@company.com"]
    },
    {
      id: '4',
      title: "Industry Trends Video",
      description: "2-minute explainer video on 2025 marketing trends",
      type: "video",
      stage: "scheduled",
      scheduledDate: "2025-01-10",
      publishDate: "2025-01-10T09:00:00Z",
      assignee: "Video Producer",
      assigneeType: "user",
      priority: "medium",
      campaign: "Thought Leadership",
      tags: ["Trends", "Video Content", "Industry"],
      aiGenerated: false,
      estimatedReadTime: 2,
      comments: 1,
      approvals: ["creative@company.com"]
    }
  ])

  // Pipeline automation rules
  const [pipelineRules, setPipelineRules] = useState<PipelineRule[]>([
    {
      id: 'rule-1',
      name: 'Auto-generate blog posts',
      description: 'Automatically create blog post drafts when campaign is created',
      contentType: ['blog'],
      trigger: 'campaign',
      actions: ['generate-draft', 'assign-ai', 'add-to-review-queue'],
      enabled: true
    },
    {
      id: 'rule-2',
      name: 'Social media approval flow',
      description: 'Require manager approval for all social media posts',
      contentType: ['instagram', 'facebook', 'twitter', 'linkedin'],
      trigger: 'manual',
      actions: ['request-approval', 'notify-manager'],
      enabled: true
    },
    {
      id: 'rule-3',
      name: 'Scheduled content publishing',
      description: 'Automatically publish content at scheduled times',
      contentType: ['blog', 'instagram', 'facebook', 'twitter', 'linkedin'],
      trigger: 'schedule',
      actions: ['publish-content', 'update-analytics', 'notify-team'],
      enabled: true
    }
  ])

  // Quality control checks
  const [qualityChecks, setQualityChecks] = useState<QualityCheck[]>([
    {
      id: 'check-1',
      name: 'Grammar & Spelling',
      description: 'Automated grammar and spelling verification',
      type: 'grammar',
      enabled: true,
      threshold: 95
    },
    {
      id: 'check-2',
      name: 'Brand Voice Consistency',
      description: 'Ensure content matches brand voice guidelines',
      type: 'brand',
      enabled: true,
      threshold: 85
    },
    {
      id: 'check-3',
      name: 'SEO Optimization',
      description: 'Check for SEO best practices and keyword usage',
      type: 'seo',
      enabled: true,
      threshold: 80
    },
    {
      id: 'check-4',
      name: 'Readability Score',
      description: 'Ensure content is readable for target audience',
      type: 'readability',
      enabled: true,
      threshold: 70
    }
  ])

  // Load existing pipeline configuration
  useEffect(() => {
    if (context.contentPipeline) {
      setPipelineStatus(context.contentPipeline.status || 'idle')
      if (context.contentPipeline.contentItems) {
        setContentItems(context.contentPipeline.contentItems)
      }
    }
  }, [context.contentPipeline])

  const getTypeColor = (type: ContentType) => {
    const colors = {
      blog: 'bg-yellow-100 text-yellow-700 hover:bg-yellow-200',
      instagram: 'bg-pink-100 text-pink-700 hover:bg-pink-200',
      facebook: 'bg-blue-100 text-blue-700 hover:bg-blue-200',
      twitter: 'bg-sky-100 text-sky-700 hover:bg-sky-200',
      linkedin: 'bg-indigo-100 text-indigo-700 hover:bg-indigo-200',
      email: 'bg-purple-100 text-purple-700 hover:bg-purple-200',
      video: 'bg-red-100 text-red-700 hover:bg-red-200',
      image: 'bg-green-100 text-green-700 hover:bg-green-200'
    }
    return colors[type] || 'bg-gray-100 text-gray-700 hover:bg-gray-200'
  }

  const getTypeIcon = (type: ContentType) => {
    const icons = {
      blog: FileText,
      instagram: Image,
      facebook: MessageSquare,
      twitter: MessageSquare,
      linkedin: Users,
      email: Mail,
      video: Video,
      image: Image
    }
    const Icon = icons[type] || FileText
    return <Icon className="h-3 w-3" />
  }

  const getStageColor = (stage: ContentStage) => {
    const colors = {
      ideas: 'bg-gray-100',
      progress: 'bg-blue-100',
      review: 'bg-orange-100',
      scheduled: 'bg-green-100',
      published: 'bg-emerald-100'
    }
    return colors[stage] || 'bg-gray-100'
  }

  const getPriorityColor = (priority: ContentItem['priority']) => {
    const colors = {
      low: 'text-gray-500',
      medium: 'text-yellow-500',
      high: 'text-red-500'
    }
    return colors[priority]
  }

  const getAssigneeStyles = (type: AssigneeType) => {
    const styles = {
      ai: 'bg-green-200 text-green-800',
      user: 'bg-blue-200 text-blue-800',
      team: 'bg-purple-200 text-purple-800'
    }
    return styles[type] || 'bg-gray-200 text-gray-800'
  }

  const getContentForStage = (stage: ContentStage) => {
    let filtered = contentItems.filter(item => item.stage === stage)
    
    if (selectedCampaign !== 'all') {
      filtered = filtered.filter(item => item.campaign === selectedCampaign)
    }
    
    if (selectedContentType !== 'all') {
      filtered = filtered.filter(item => item.type === selectedContentType)
    }
    
    return filtered
  }

  const handleGenerateContent = async () => {
    setIsGenerating(true)
    
    try {
      // Simulate AI content generation
      await new Promise(resolve => setTimeout(resolve, 2000))
      
      const newContent: ContentItem = {
        id: `generated-${Date.now()}`,
        title: "AI-Generated Marketing Insights",
        description: "Latest trends and insights in digital marketing generated by AI",
        type: "blog",
        stage: "ideas",
        assignee: "AI Assistant",
        assigneeType: "ai",
        priority: "medium",
        campaign: "AI Content Series",
        tags: ["AI", "Marketing", "Insights"],
        aiGenerated: true,
        comments: 0,
        approvals: []
      }
      
      setContentItems(prev => [newContent, ...prev])
      
      toast({
        title: 'Content Generated!',
        description: 'New AI-generated content has been added to your pipeline.'
      })
    } catch (error) {
      toast({
        title: 'Generation Failed',
        description: 'Unable to generate content. Please try again.',
        variant: 'destructive'
      })
    } finally {
      setIsGenerating(false)
    }
  }

  const handleTogglePipeline = () => {
    const newStatus = pipelineStatus === 'running' ? 'paused' : 'running'
    setPipelineStatus(newStatus)
    
    toast({
      title: `Pipeline ${newStatus === 'running' ? 'Started' : 'Paused'}`,
      description: `Content pipeline is now ${newStatus}.`
    })
  }

  const handleRuleToggle = (ruleId: string, enabled: boolean) => {
    setPipelineRules(prev => 
      prev.map(rule => 
        rule.id === ruleId ? { ...rule, enabled } : rule
      )
    )
  }

  const handleQualityToggle = (checkId: string, enabled: boolean) => {
    setQualityChecks(prev => 
      prev.map(check => 
        check.id === checkId ? { ...check, enabled } : check
      )
    )
  }

  const handleComplete = () => {
    // Save pipeline configuration to context
    updateContext({
      contentPipeline: {
        configured: true,
        status: pipelineStatus,
        contentItems,
        pipelineRules,
        qualityChecks,
        completedAt: new Date().toISOString()
      },
      currentPhase: 'complete'
    })

    toast({
      title: 'Content Pipeline Configured!',
      description: 'Your content generation pipeline is ready for production.'
    })

    if (onNext) {
      onNext()
    }
  }

  const enabledRulesCount = pipelineRules.filter(rule => rule.enabled).length
  const enabledChecksCount = qualityChecks.filter(check => check.enabled).length

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="space-y-6"
    >
      {/* Header */}
      <div className="text-center">
        <h2 className="text-3xl font-bold text-gray-900 mb-2">Content Pipeline Configuration</h2>
        <p className="text-lg text-gray-600 mb-6">
          Set up your content generation workflow with automation rules and quality controls
        </p>
      </div>

      {/* Pipeline Status & Controls */}
      <Card>
        <CardContent className="p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2">
                <div className={`w-3 h-3 rounded-full ${
                  pipelineStatus === 'running' ? 'bg-green-500' : 
                  pipelineStatus === 'paused' ? 'bg-yellow-500' : 'bg-gray-500'
                }`} />
                <span className="font-medium">
                  Pipeline {pipelineStatus === 'running' ? 'Running' : 
                           pipelineStatus === 'paused' ? 'Paused' : 'Stopped'}
                </span>
              </div>
            </div>
            
            <div className="flex items-center space-x-2">
              <Button
                onClick={handleTogglePipeline}
                variant={pipelineStatus === 'running' ? 'destructive' : 'default'}
                size="sm"
              >
                {pipelineStatus === 'running' ? (
                  <>
                    <Pause className="h-4 w-4 mr-2" />
                    Pause Pipeline
                  </>
                ) : (
                  <>
                    <Play className="h-4 w-4 mr-2" />
                    Start Pipeline
                  </>
                )}
              </Button>
              
              <Button
                onClick={handleGenerateContent}
                disabled={isGenerating}
                className="bg-blue-600 hover:bg-blue-700"
                size="sm"
              >
                {isGenerating ? (
                  <>
                    <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                    Generating...
                  </>
                ) : (
                  <>
                    <PlusCircle className="h-4 w-4 mr-2" />
                    Generate Content
                  </>
                )}
              </Button>
            </div>
          </div>

          {/* Quick Stats */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-600">{contentItems.length}</div>
              <div className="text-sm text-gray-600">Total Items</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-green-600">{enabledRulesCount}</div>
              <div className="text-sm text-gray-600">Active Rules</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-purple-600">{enabledChecksCount}</div>
              <div className="text-sm text-gray-600">Quality Checks</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-orange-600">
                {contentItems.filter(item => item.aiGenerated).length}
              </div>
              <div className="text-sm text-gray-600">AI Generated</div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Main Tabs */}
      <Tabs value={activeTab} onValueChange={(value) => setActiveTab(value as any)}>
        <TabsList className="mb-6">
          <TabsTrigger value="pipeline">Pipeline View</TabsTrigger>
          <TabsTrigger value="rules">Automation Rules</TabsTrigger>
          <TabsTrigger value="quality">Quality Control</TabsTrigger>
        </TabsList>

        <TabsContent value="pipeline">
          {/* Filters */}
          <div className="flex flex-wrap gap-4 mb-6">
            <Select value={selectedCampaign} onValueChange={setSelectedCampaign}>
              <SelectTrigger className="w-[200px]">
                <SelectValue placeholder="All Campaigns" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Campaigns</SelectItem>
                <SelectItem value="AI Marketing Series">AI Marketing Series</SelectItem>
                <SelectItem value="Social Proof Campaign">Social Proof Campaign</SelectItem>
                <SelectItem value="Feature Launch">Feature Launch</SelectItem>
                <SelectItem value="Thought Leadership">Thought Leadership</SelectItem>
              </SelectContent>
            </Select>

            <Select value={selectedContentType} onValueChange={setSelectedContentType}>
              <SelectTrigger className="w-[200px]">
                <SelectValue placeholder="All Content Types" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Types</SelectItem>
                <SelectItem value="blog">Blog Posts</SelectItem>
                <SelectItem value="instagram">Instagram</SelectItem>
                <SelectItem value="email">Email</SelectItem>
                <SelectItem value="video">Video</SelectItem>
              </SelectContent>
            </Select>
            
            <div className="flex items-center space-x-2">
              <Checkbox 
                id="show-completed" 
                checked={showCompleted}
                onCheckedChange={(checked) => setShowCompleted(!!checked)}
              />
              <Label htmlFor="show-completed" className="text-sm">Show published</Label>
            </div>
          </div>

          {/* Kanban Board */}
          <div className="grid grid-cols-1 lg:grid-cols-4 xl:grid-cols-5 gap-4 overflow-x-auto">
            {(['ideas', 'progress', 'review', 'scheduled', 'published'] as ContentStage[]).map(stage => (
              <div key={stage} className={`min-w-[280px] rounded-lg p-4 ${getStageColor(stage)}`}>
                <h3 className="font-semibold text-sm mb-3 flex justify-between items-center capitalize">
                  <span>{stage}</span>
                  <Badge variant="outline">{getContentForStage(stage).length}</Badge>
                </h3>
                
                <div className="space-y-3">
                  <AnimatePresence>
                    {getContentForStage(stage).map((item) => (
                      <motion.div
                        key={item.id}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -10 }}
                        whileHover={{ scale: 1.02 }}
                        className="bg-white p-4 rounded-lg border border-gray-200 shadow-sm cursor-pointer hover:shadow-md transition-all"
                      >
                        {/* Content Type & Priority */}
                        <div className="flex justify-between items-center mb-3">
                          <Badge className={`${getTypeColor(item.type)} text-xs`}>
                            <div className="flex items-center space-x-1">
                              {getTypeIcon(item.type)}
                              <span>{item.type}</span>
                            </div>
                          </Badge>
                          <div className="flex items-center space-x-1">
                            <div className={`w-2 h-2 rounded-full ${getPriorityColor(item.priority)}`} />
                            <button className="text-gray-400 hover:text-gray-700">
                              <MoreVertical className="h-4 w-4" />
                            </button>
                          </div>
                        </div>

                        {/* Title & Description */}
                        <h4 className="font-medium text-sm mb-2 line-clamp-2">{item.title}</h4>
                        <p className="text-xs text-gray-600 mb-3 line-clamp-2">{item.description}</p>

                        {/* Campaign & Tags */}
                        {item.campaign && (
                          <div className="mb-2">
                            <Badge variant="outline" className="text-xs">
                              {item.campaign}
                            </Badge>
                          </div>
                        )}

                        {/* Metadata */}
                        <div className="flex justify-between items-center text-xs text-gray-500 mb-3">
                          <div className="flex items-center space-x-1">
                            <Calendar className="h-3 w-3" />
                            <span>{item.scheduledDate || 'No date'}</span>
                          </div>
                          {item.aiGenerated && (
                            <div className="flex items-center space-x-1">
                              <Bot className="h-3 w-3 text-green-600" />
                              <span className="text-green-600">AI</span>
                            </div>
                          )}
                        </div>

                        {/* Footer */}
                        <div className="flex justify-between items-center">
                          <div className="flex items-center space-x-2">
                            <Avatar className={`h-6 w-6 ${getAssigneeStyles(item.assigneeType)}`}>
                              <AvatarFallback className="text-xs">
                                {item.assigneeType === 'ai' ? 'AI' : 
                                 item.assigneeType === 'team' ? 'TM' : 
                                 item.assignee.substring(0, 2).toUpperCase()}
                              </AvatarFallback>
                            </Avatar>
                            {item.comments > 0 && (
                              <Badge variant="outline" className="text-xs">
                                {item.comments} comments
                              </Badge>
                            )}
                          </div>
                          
                          {item.approvals.length > 0 && (
                            <div className="flex items-center space-x-1">
                              <CheckCircle2 className="h-3 w-3 text-green-600" />
                              <span className="text-xs text-green-600">{item.approvals.length}</span>
                            </div>
                          )}
                        </div>
                      </motion.div>
                    ))}
                  </AnimatePresence>
                </div>
              </div>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="rules">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Settings className="h-5 w-5" />
                <span>Pipeline Automation Rules</span>
              </CardTitle>
              <CardDescription>
                Configure automation rules to streamline your content workflow
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {pipelineRules.map((rule) => (
                  <div key={rule.id} className="flex items-center justify-between p-4 border rounded-lg">
                    <div className="flex-1">
                      <div className="flex items-center space-x-3">
                        <Checkbox
                          checked={rule.enabled}
                          onCheckedChange={(checked) => handleRuleToggle(rule.id, !!checked)}
                        />
                        <div>
                          <h4 className="font-medium">{rule.name}</h4>
                          <p className="text-sm text-gray-600">{rule.description}</p>
                          <div className="flex items-center space-x-2 mt-2">
                            <Badge variant="outline">{rule.trigger}</Badge>
                            <span className="text-xs text-gray-500">
                              {rule.actions.length} actions
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>
                    <Button variant="ghost" size="sm">
                      <Settings className="h-4 w-4" />
                    </Button>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="quality">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <CheckCircle2 className="h-5 w-5" />
                <span>Quality Control Checks</span>
              </CardTitle>
              <CardDescription>
                Configure quality checks to ensure content meets your standards
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {qualityChecks.map((check) => (
                  <div key={check.id} className="flex items-center justify-between p-4 border rounded-lg">
                    <div className="flex-1">
                      <div className="flex items-center space-x-3">
                        <Checkbox
                          checked={check.enabled}
                          onCheckedChange={(checked) => handleQualityToggle(check.id, !!checked)}
                        />
                        <div>
                          <h4 className="font-medium">{check.name}</h4>
                          <p className="text-sm text-gray-600">{check.description}</p>
                          <div className="flex items-center space-x-2 mt-2">
                            <Badge variant="outline">{check.type}</Badge>
                            {check.threshold && (
                              <span className="text-xs text-gray-500">
                                Threshold: {check.threshold}%
                              </span>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                    <Button variant="ghost" size="sm">
                      <Settings className="h-4 w-4" />
                    </Button>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Action Buttons */}
      <div className="flex justify-between">
        {onBack && (
          <Button variant="outline" onClick={onBack}>
            <ChevronLeft className="h-4 w-4 mr-2" />
            Back
          </Button>
        )}
        
        <Button 
          onClick={handleComplete}
          size="lg"
          className="bg-green-600 hover:bg-green-700"
        >
          Complete Pipeline Setup
          <ChevronRight className="h-4 w-4 ml-2" />
        </Button>
      </div>
    </motion.div>
  )
}