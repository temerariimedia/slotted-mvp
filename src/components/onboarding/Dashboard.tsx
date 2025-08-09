/**
 * Dashboard.tsx
 * Step 15: Final dashboard and completion summary
 * Features: Setup summary, Next steps, Quick actions, System overview
 */

import React, { useState } from 'react'
import { Button } from '../ui/button'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../ui/card'
import { Badge } from '../ui/badge'
import { Progress } from '../ui/progress'
import { 
  PlusCircle, 
  Calendar, 
  Kanban, 
  Folder, 
  ThumbsUp, 
  MessageSquare, 
  Heart, 
  Clock, 
  Send, 
  Mail, 
  Facebook, 
  Twitter, 
  Instagram, 
  ArrowRight, 
  CheckCircle,
  Target,
  Users,
  TrendingUp,
  FileText,
  Settings,
  Download,
  Share2,
  BarChart3
} from 'lucide-react'
import { motion } from 'framer-motion'
import { useSlottedContext } from '../../contexts/SlottedContext'
import { useToast } from '../../hooks/use-toast'

interface DashboardProps {
  className?: string
  onNext?: () => void
  onBack?: () => void
  isFirst?: boolean
  isLast?: boolean
  onComplete?: () => void
  onNavigateToMVP?: (mvp: string) => void
}

interface CompletionSummary {
  totalSteps: number
  completedSteps: number
  setupProgress: number
  nextActions: string[]
}

export default function Dashboard({ className, onNext, onBack, isLast, onComplete, onNavigateToMVP }: DashboardProps) {
  const [slottedData, setSlottedData] = useSlottedContext()
  const { toast } = useToast()
  
  const fadeInUp = {
    initial: { opacity: 0, y: 20 },
    animate: { opacity: 1, y: 0 },
    transition: { duration: 0.5 }
  }
  
  // Calculate completion summary based on context data
  const getCompletionSummary = (): CompletionSummary => {
    const checks = [
      { key: 'companyInfo', completed: !!slottedData.companyInfo?.companyName },
      { key: 'brandDNA', completed: !!slottedData.brandDNA?.valuePropositions?.length },
      { key: 'targetSegments', completed: !!slottedData.targetSegments?.primarySegment },
      { key: 'marketingGoals', completed: !!slottedData.marketingGoals?.primaryGoals?.length },
      { key: 'gtmStrategy', completed: !!slottedData.gtmStrategy?.segments?.length },
      { key: 'contentPreferences', completed: !!slottedData.contentPreferences?.contentTypes?.length },
      { key: 'aiPersona', completed: !!slottedData.aiPersona?.personalityTraits?.length },
      { key: 'competitiveAnalysis', completed: !!slottedData.competitiveAnalysis?.competitors?.length },
      { key: 'pricingStrategy', completed: !!slottedData.pricingStrategy?.model },
      { key: 'channelConfiguration', completed: !!slottedData.channelConfiguration?.primary?.length },
      { key: 'successMetrics', completed: !!slottedData.successMetrics?.metrics?.length },
      { key: 'calendarScope', completed: !!slottedData.calendarScope?.timeframe },
      { key: 'googleDriveIntegration', completed: !!slottedData.googleDriveIntegration?.connected },
      { key: 'contentPipeline', completed: !!slottedData.contentPipeline?.configured }
    ]
    
    const completedSteps = checks.filter(check => check.completed).length
    const totalSteps = checks.length
    const setupProgress = Math.round((completedSteps / totalSteps) * 100)
    
    const nextActions = []
    if (!slottedData.googleDriveIntegration?.connected) nextActions.push('Connect Google Drive')
    if (!slottedData.contentPipeline?.configured) nextActions.push('Set up content pipeline')
    if (!slottedData.marketingPlan?.configured) nextActions.push('Create marketing plan')
    if (nextActions.length === 0) nextActions.push('Start creating content')
    
    return { totalSteps, completedSteps, setupProgress, nextActions }
  }
  
  const completionSummary = getCompletionSummary()
  
  const handleCompleteOnboarding = () => {
    setSlottedData({
      ...slottedData,
      currentPhase: 'complete',
      metadata: {
        ...slottedData.metadata,
        updatedAt: new Date().toISOString(),
        completedAt: new Date().toISOString()
      }
    })
    
    toast({
      title: "🎉 Onboarding Complete!",
      description: "Welcome to your personalized marketing workspace. Ready to create amazing content?",
    })
    
    // Use onNext if available (part of onboarding flow) or onComplete as fallback
    if (onNext) {
      onNext()
    } else if (onComplete) {
      onComplete()
    }
  }
  
  const handleQuickAction = (action: string) => {
    switch (action) {
      case 'dna-extractor':
        if (onNavigateToMVP) onNavigateToMVP('mvp1')
        break
      case 'calendar-generator':
        if (onNavigateToMVP) onNavigateToMVP('mvp2')
        break
      case 'blog-engine':
        if (onNavigateToMVP) onNavigateToMVP('mvp3')
        break
      case 'marketing-planner':
        if (onNavigateToMVP) onNavigateToMVP('planner')
        break
      default:
        toast({
          title: "Feature Coming Soon",
          description: `${action} will be available in the next update.`,
        })
    }
  }
  
  const exportConfiguration = () => {
    const exportData = {
      companyProfile: {
        name: slottedData.companyInfo?.companyName,
        industry: slottedData.companyInfo?.industry,
        size: slottedData.companyInfo?.size,
        website: slottedData.companyInfo?.website
      },
      brandDNA: slottedData.brandDNA,
      marketingStrategy: {
        goals: slottedData.marketingGoals,
        channels: slottedData.channelConfiguration,
        gtmStrategy: slottedData.gtmStrategy
      },
      contentStrategy: {
        preferences: slottedData.contentPreferences,
        pipeline: slottedData.contentPipeline,
        aiPersona: slottedData.aiPersona
      },
      completionSummary,
      exportedAt: new Date().toISOString()
    }
    
    const blob = new Blob([JSON.stringify(exportData, null, 2)], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `${slottedData.companyInfo?.companyName || 'slotted'}-configuration.json`
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
    
    toast({
      title: "Configuration Exported",
      description: "Your complete setup has been saved as a JSON file.",
    })
  }

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Header */}
      <motion.div {...fadeInUp} className="text-center">
        <div className="w-20 h-20 bg-gradient-to-br from-green-500 to-green-600 rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-lg">
          <CheckCircle className="w-10 h-10 text-white" />
        </div>
        <h1 className="text-3xl font-bold text-gray-900 mb-2">🎉 Setup Complete!</h1>
        <p className="text-lg text-gray-600 max-w-2xl mx-auto">
          Congratulations! Your personalized marketing workspace is ready. 
          Here's your summary and next steps to get started.
        </p>
      </motion.div>

      {/* Completion Summary */}
      <motion.div {...fadeInUp} transition={{ delay: 0.1 }}>
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Target className="w-5 h-5 text-green-600" />
              Setup Summary
            </CardTitle>
            <CardDescription>
              {completionSummary.completedSteps} of {completionSummary.totalSteps} configuration steps completed
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium">Overall Progress</span>
              <span className="text-sm text-gray-600">{completionSummary.setupProgress}%</span>
            </div>
            <Progress value={completionSummary.setupProgress} className="h-2" />
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-4">
              <div className="text-center">
                <div className="text-2xl font-bold text-green-600">{completionSummary.completedSteps}</div>
                <div className="text-sm text-gray-600">Steps Complete</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-blue-600">
                  {slottedData.channelConfiguration?.primary?.length || 0}
                </div>
                <div className="text-sm text-gray-600">Channels Configured</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-purple-600">
                  {slottedData.marketingGoals?.primaryGoals?.length || 0}
                </div>
                <div className="text-sm text-gray-600">Marketing Goals</div>
              </div>
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Quick Actions */}
      <motion.div {...fadeInUp} transition={{ delay: 0.2 }}>
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <PlusCircle className="w-5 h-5 text-blue-600" />
              Quick Actions
            </CardTitle>
            <CardDescription>Jump right into creating and managing your marketing content</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <Button 
                variant="outline" 
                className="h-auto p-4 flex-col items-start"
                onClick={() => handleQuickAction('dna-extractor')}
              >
                <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center mb-2">
                  <FileText className="w-4 h-4 text-blue-600" />
                </div>
                <div className="text-left">
                  <div className="font-medium">Extract Company DNA</div>
                  <div className="text-xs text-gray-500">Analyze website & brand</div>
                </div>
              </Button>
              
              <Button 
                variant="outline" 
                className="h-auto p-4 flex-col items-start"
                onClick={() => handleQuickAction('calendar-generator')}
              >
                <div className="w-8 h-8 bg-green-100 rounded-lg flex items-center justify-center mb-2">
                  <Calendar className="w-4 h-4 text-green-600" />
                </div>
                <div className="text-left">
                  <div className="font-medium">Generate Calendar</div>
                  <div className="text-xs text-gray-500">13-week content plan</div>
                </div>
              </Button>
              
              <Button 
                variant="outline" 
                className="h-auto p-4 flex-col items-start"
                onClick={() => handleQuickAction('blog-engine')}
              >
                <div className="w-8 h-8 bg-purple-100 rounded-lg flex items-center justify-center mb-2">
                  <FileText className="w-4 h-4 text-purple-600" />
                </div>
                <div className="text-left">
                  <div className="font-medium">Create Content</div>
                  <div className="text-xs text-gray-500">AI-powered writing</div>
                </div>
              </Button>
              
              <Button 
                variant="outline" 
                className="h-auto p-4 flex-col items-start"
                onClick={() => handleQuickAction('marketing-planner')}
              >
                <div className="w-8 h-8 bg-teal-100 rounded-lg flex items-center justify-center mb-2">
                  <Kanban className="w-4 h-4 text-teal-600" />
                </div>
                <div className="text-left">
                  <div className="font-medium">Marketing Planner</div>
                  <div className="text-xs text-gray-500">Comprehensive planning</div>
                </div>
              </Button>
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* System Overview */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Your Configuration */}
        <motion.div {...fadeInUp} transition={{ delay: 0.3 }}>
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Settings className="w-5 h-5 text-gray-600" />
                Your Configuration
              </CardTitle>
              <CardDescription>Key details about your marketing setup</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-3">
                <div className="flex items-center justify-between py-2 border-b border-gray-100">
                  <span className="text-sm font-medium">Company</span>
                  <span className="text-sm text-gray-600">
                    {slottedData.companyInfo?.companyName || 'Not specified'}
                  </span>
                </div>
                <div className="flex items-center justify-between py-2 border-b border-gray-100">
                  <span className="text-sm font-medium">Industry</span>
                  <span className="text-sm text-gray-600">
                    {slottedData.companyInfo?.industry || 'Not specified'}
                  </span>
                </div>
                <div className="flex items-center justify-between py-2 border-b border-gray-100">
                  <span className="text-sm font-medium">Primary Goals</span>
                  <span className="text-sm text-gray-600">
                    {slottedData.marketingGoals?.primaryGoals?.length || 0} selected
                  </span>
                </div>
                <div className="flex items-center justify-between py-2 border-b border-gray-100">
                  <span className="text-sm font-medium">Channels</span>
                  <span className="text-sm text-gray-600">
                    {slottedData.channelConfiguration?.primary?.length || 0} configured
                  </span>
                </div>
                <div className="flex items-center justify-between py-2">
                  <span className="text-sm font-medium">Google Drive</span>
                  <Badge variant={slottedData.googleDriveIntegration?.connected ? "default" : "secondary"}>
                    {slottedData.googleDriveIntegration?.connected ? "Connected" : "Not connected"}
                  </Badge>
                </div>
              </div>
              
              <div className="pt-4">
                <Button 
                  variant="outline" 
                  size="sm" 
                  onClick={exportConfiguration}
                  className="w-full"
                >
                  <Download className="w-4 h-4 mr-2" />
                  Export Configuration
                </Button>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Next Steps */}
        <motion.div {...fadeInUp} transition={{ delay: 0.4 }}>
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <ArrowRight className="w-5 h-5 text-blue-600" />
                Next Steps
              </CardTitle>
              <CardDescription>Recommended actions to get the most out of Slotted</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-3">
                {completionSummary.nextActions.map((action, index) => (
                  <div key={index} className="flex items-start gap-3 p-3 bg-blue-50 rounded-lg">
                    <div className="w-6 h-6 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                      <span className="text-xs font-medium text-blue-600">{index + 1}</span>
                    </div>
                    <div>
                      <div className="font-medium text-sm">{action}</div>
                      <div className="text-xs text-gray-600 mt-1">
                        {action.includes('Drive') && 'Sync your content with Google Workspace'}
                        {action.includes('pipeline') && 'Set up automated content workflows'}
                        {action.includes('marketing') && 'Create comprehensive campaign plans'}
                        {action.includes('content') && 'Start generating your first blog post'}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
              
              <div className="pt-4 border-t border-gray-100">
                <div className="flex items-center gap-2 text-sm text-gray-600 mb-3">
                  <Users className="w-4 h-4" />
                  <span>Need help? Our support team is ready to assist you.</span>
                </div>
                <div className="flex gap-2">
                  <Button variant="outline" size="sm" className="flex-1">
                    <MessageSquare className="w-4 h-4 mr-2" />
                    Support
                  </Button>
                  <Button variant="outline" size="sm" className="flex-1">
                    <FileText className="w-4 h-4 mr-2" />
                    Docs
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>

      {/* Recent Activity Mock */}
      <motion.div {...fadeInUp} transition={{ delay: 0.5 }}>
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BarChart3 className="w-5 h-5 text-green-600" />
              Recent Activity
            </CardTitle>
            <CardDescription>Your latest marketing activities and performance</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="text-center p-4 bg-gray-50 rounded-lg">
                <div className="text-2xl font-bold text-blue-600">0</div>
                <div className="text-sm text-gray-600">Posts Scheduled</div>
                <div className="text-xs text-gray-500 mt-1">Ready to start creating</div>
              </div>
              <div className="text-center p-4 bg-gray-50 rounded-lg">
                <div className="text-2xl font-bold text-green-600">1</div>
                <div className="text-sm text-gray-600">Setup Complete</div>
                <div className="text-xs text-gray-500 mt-1">All systems ready</div>
              </div>
              <div className="text-center p-4 bg-gray-50 rounded-lg">
                <div className="text-2xl font-bold text-purple-600">
                  {completionSummary.setupProgress}%
                </div>
                <div className="text-sm text-gray-600">Configuration</div>
                <div className="text-xs text-gray-500 mt-1">Platform optimized</div>
              </div>
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Final Actions */}
      <motion.div {...fadeInUp} transition={{ delay: 0.6 }} className="flex flex-col sm:flex-row gap-4 pt-6">
        <Button onClick={handleCompleteOnboarding} className="flex-1" size="lg">
          <CheckCircle className="w-5 h-5 mr-2" />
          Complete Setup & Continue
        </Button>
        <Button 
          variant="outline" 
          onClick={exportConfiguration}
          size="lg"
        >
          <Share2 className="w-5 h-5 mr-2" />
          Save Configuration
        </Button>
      </motion.div>
    </div>
  )
}