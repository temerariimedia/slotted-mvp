import React, { useState, useEffect } from 'react'
import { Button } from '../ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card'
import { Badge } from '../ui/badge'
import { Label } from '../ui/label'
import { Input } from '../ui/input'
import { Textarea } from '../ui/textarea'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../ui/tabs'
import { 
  TooltipProvider, 
  Tooltip, 
  TooltipTrigger, 
  TooltipContent 
} from '../ui/tooltip'
import { 
  Bot, 
  Video, 
  Image,
  Camera,
  Upload, 
  CheckCircle2,
  Settings,
  Sparkles,
  Info,
  X,
  Check,
  Play,
  User,
  ArrowLeft,
  Webcam,
  ChevronLeft,
  ChevronRight,
  Loader2,
  Monitor,
  Users
} from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import { useSlottedContext } from '../../contexts/SlottedContext'
import { useToast } from '../../hooks/use-toast'
import { modernAIOrchestrator } from '../../services/ai/modern-ai-orchestrator'

const AVATAR_SETUP_STEPS = [
  "Introduction",
  "Instructions", 
  "Upload",
  "Consent",
  "Review"
]

// Recording tips
const RECORDING_TIPS = {
  recommended: [
    "Submit 2-5 mins of footage (required)",
    "Use a high resolution camera",
    "Record in a well-lit, quiet environment",
    "Look directly into the camera",
    "Pause between each sentence with your mouth closed",
    "Use generic gestures and keep hands below your chest"
  ],
  avoid: [
    "Stitched or cut footage",
    "Talking without pauses",
    "Changing positions while recording",
    "Loud background noise",
    "Shadows on or overexposure of your face",
    "Diverting your gaze or looking around",
    "Hand gestures above the chest",
    "Use of pointing gestures"
  ]
}

interface AICloneSetupProps {
  onNext: () => void
  onBack: () => void
}

export default function AICloneSetup({ onNext, onBack }: AICloneSetupProps) {
  const { context, updateContext } = useSlottedContext()
  const { toast } = useToast()
  
  // Setup states
  const [activeTab, setActiveTab] = useState('avatar')
  const [cloneName, setCloneName] = useState(context.aiPersona?.communicationPattern || "Marketing AI Assistant")
  
  // Avatar creation states
  const [avatarSetupStep, setAvatarSetupStep] = useState(0)
  const [avatarType, setAvatarType] = useState<'still' | 'motion'>('still')
  const [videoUrl, setVideoUrl] = useState('')
  const [showBackgroundRemoval, setShowBackgroundRemoval] = useState(false)
  const [useHighResolution, setUseHighResolution] = useState(false)
  const [showTips, setShowTips] = useState(true)
  const [isRecording, setIsRecording] = useState(false)
  const [isUploading, setIsUploading] = useState(false)
  const [hasRecordedVideo, setHasRecordedVideo] = useState(false)
  const [keepAmbientSound, setKeepAmbientSound] = useState(true)
  const [avatarFinished, setAvatarFinished] = useState(false)
  const [showSettingsModal, setShowSettingsModal] = useState(false)
  
  // AI Configuration
  const [aiConfig, setAiConfig] = useState({
    usePersonalizedResponses: true,
    maintainBrandVoice: true,
    adaptToAudience: true,
    enableLearning: true
  })

  // Update context when configuration changes
  useEffect(() => {
    updateContext({
      aiPersona: {
        ...context.aiPersona,
        communicationPattern: cloneName,
        personalityTraits: [
          ...(context.aiPersona?.personalityTraits || []),
          ...(aiConfig.usePersonalizedResponses ? ['personalized'] : []),
          ...(aiConfig.maintainBrandVoice ? ['brand-consistent'] : []),
          ...(aiConfig.adaptToAudience ? ['adaptive'] : [])
        ],
        knowledgeAreas: context.aiPersona?.knowledgeAreas || [],
        constraints: context.aiPersona?.constraints || []
      }
    })
  }, [cloneName, aiConfig])

  const handleStartRecording = () => {
    setIsRecording(true)
    toast({
      title: "Recording started",
      description: "Your webcam is now recording. This is a simulation for demo purposes."
    })
    
    // Simulate recording process
    setTimeout(() => {
      setIsRecording(false)
      setHasRecordedVideo(true)
      setVideoUrl('demo-video-url')
      
      toast({
        title: "Recording complete",
        description: "Your video has been recorded successfully"
      })
      
      handleNextStep()
    }, 3000)
  }

  const handleUploadFile = () => {
    setIsUploading(true)
    toast({
      title: "Uploading video",
      description: "Your video is being uploaded. This is a simulation for demo purposes."
    })
    
    // Simulate upload process
    setTimeout(() => {
      setIsUploading(false)
      setHasRecordedVideo(true)
      setVideoUrl('demo-video-url')
      
      toast({
        title: "Upload complete",
        description: "Your video has been uploaded successfully"
      })
      
      handleNextStep()
    }, 2500)
  }

  const handleNextStep = () => {
    if (avatarSetupStep < AVATAR_SETUP_STEPS.length - 1) {
      setAvatarSetupStep(avatarSetupStep + 1)
    }
  }

  const handlePreviousStep = () => {
    if (avatarSetupStep > 0) {
      setAvatarSetupStep(avatarSetupStep - 1)
    }
  }

  const resetRecording = () => {
    setHasRecordedVideo(false)
    setVideoUrl('')
  }

  const generateCampaign = () => {
    // Mark onboarding as complete
    updateContext({
      currentPhase: 'complete'
    })
    
    toast({
      title: "Setup Complete!",
      description: "Your AI marketing assistant is ready. Redirecting to campaign generator..."
    })
    
    // Navigate to next phase
    setTimeout(() => {
      onNext()
    }, 1500)
  }

  // Generate AI-powered clone configuration
  const generateAICloneConfig = async () => {
    try {
      const brandContext = `
        Company: ${context.companyInfo?.companyName || context.companyName || 'Your Company'}
        Industry: ${context.companyInfo?.industry || context.industry || 'Business'}
        Brand Personality: ${context.brandDNA?.brandTone?.personality?.join(', ') || 'Professional'}
        Communication Style: ${context.brandDNA?.brandTone?.communicationStyle || 'Conversational'}
        Target Audience: ${context.targetAudience || 'Business professionals'}
      `

      const prompt = `Based on this brand context, suggest an AI assistant name and configuration that would be perfect for this company:

${brandContext}

Provide a JSON response with:
{
  "assistantName": "A professional name for the AI assistant",
  "description": "Brief description of the AI assistant's role",
  "keyFeatures": ["feature1", "feature2", "feature3"],
  "recommendedSettings": {
    "usePersonalizedResponses": true/false,
    "maintainBrandVoice": true/false,
    "adaptToAudience": true/false,
    "enableLearning": true/false
  }
}`

      const response = await modernAIOrchestrator.generateContent({
        prompt,
        context: 'ai-clone-configuration',
        temperature: 0.3
      })

      const aiSuggestion = JSON.parse(response.content)
      
      setCloneName(aiSuggestion.assistantName)
      setAiConfig(aiSuggestion.recommendedSettings)
      
      toast({
        title: "AI Configuration Generated",
        description: "Optimized settings based on your brand profile"
      })
    } catch (error) {
      console.error('Error generating AI config:', error)
      toast({
        title: "Configuration Error",
        description: "Using default settings. You can customize them manually."
      })
    }
  }

  const renderAvatarCreationStep = () => {
    switch (avatarSetupStep) {
      case 0: // Introduction
        return (
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-6"
          >
            <div className="text-center">
              <Bot className="h-16 w-16 text-violet-600 mx-auto mb-4" />
              <h3 className="text-2xl font-semibold mb-2">Create Your AI Marketing Assistant</h3>
              <p className="text-gray-600 max-w-2xl mx-auto">
                Personalize your AI assistant with your brand voice and optionally create a visual avatar 
                to make your marketing communications more engaging and consistent.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-4xl mx-auto">
              <motion.div
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                <Card 
                  className={`cursor-pointer transition-all duration-200 ${
                    avatarType === 'still' ? 'border-violet-500 bg-violet-50 ring-2 ring-violet-200' : 'hover:border-violet-300'
                  }`}
                  onClick={() => setAvatarType('still')}
                >
                  <CardContent className="pt-6 pb-6 flex flex-col items-center text-center">
                    <Image className="h-12 w-12 mb-4 text-violet-600" />
                    <h4 className="font-semibold text-lg mb-2">Still Avatar</h4>
                    <p className="text-sm text-gray-600 mb-4">
                      Professional static avatar with minimal movement, perfect for consistent brand representation.
                    </p>
                    <Badge variant="outline" className="text-xs">
                      Recommended for business communications
                    </Badge>
                  </CardContent>
                </Card>
              </motion.div>

              <motion.div
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                <Card 
                  className={`cursor-pointer transition-all duration-200 ${
                    avatarType === 'motion' ? 'border-violet-500 bg-violet-50 ring-2 ring-violet-200' : 'hover:border-violet-300'
                  }`}
                  onClick={() => setAvatarType('motion')}
                >
                  <CardContent className="pt-6 pb-6 flex flex-col items-center text-center">
                    <Video className="h-12 w-12 mb-4 text-violet-600" />
                    <h4 className="font-semibold text-lg mb-2">Motion Avatar</h4>
                    <p className="text-sm text-gray-600 mb-4">
                      Dynamic avatar with natural movement and gestures, ideal for engaging video content.
                    </p>
                    <Badge variant="outline" className="text-xs">
                      Recommended for marketing campaigns
                    </Badge>
                  </CardContent>
                </Card>
              </motion.div>
            </div>

            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 max-w-2xl mx-auto">
              <div className="flex items-start gap-3">
                <Info className="h-5 w-5 text-blue-600 mt-0.5 shrink-0" />
                <div>
                  <h4 className="font-medium text-blue-900 mb-1">AI Assistant Configuration</h4>
                  <p className="text-sm text-blue-800">
                    Your AI assistant will use your brand voice, personality traits, and communication style 
                    from previous steps to ensure consistent messaging across all marketing materials.
                  </p>
                </div>
              </div>
            </div>

            <div className="pt-4 flex justify-end">
              <Button 
                onClick={handleNextStep}
                className="bg-violet-600 hover:bg-violet-700 text-white"
              >
                Continue
                <ChevronRight className="ml-2 h-4 w-4" />
              </Button>
            </div>
          </motion.div>
        )
        
      case 1: // Instructions
        return (
          <motion.div 
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            className="space-y-6"
          >
            <div className="text-center">
              <Camera className="h-12 w-12 text-violet-600 mx-auto mb-4" />
              <h3 className="text-xl font-semibold mb-2">Recording Guidelines</h3>
              <p className="text-gray-600 max-w-2xl mx-auto">
                Follow these best practices to create a high-quality avatar that represents your brand professionally.
              </p>
            </div>
            
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 max-w-4xl mx-auto">
              <Card className="border-green-200">
                <CardHeader className="pb-4">
                  <CardTitle className="text-lg text-green-700 flex items-center">
                    <Check className="h-5 w-5 mr-2" />
                    Best Practices
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-3">
                    {RECORDING_TIPS.recommended.map((tip, index) => (
                      <li key={index} className="flex items-start">
                        <Check className="h-4 w-4 text-green-500 mt-0.5 mr-3 shrink-0" />
                        <span className="text-sm">{tip}</span>
                      </li>
                    ))}
                  </ul>
                </CardContent>
              </Card>
              
              <Card className="border-red-200">
                <CardHeader className="pb-4">
                  <CardTitle className="text-lg text-red-700 flex items-center">
                    <X className="h-5 w-5 mr-2" />
                    Avoid These Issues
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-3">
                    {RECORDING_TIPS.avoid.map((tip, index) => (
                      <li key={index} className="flex items-start">
                        <X className="h-4 w-4 text-red-500 mt-0.5 mr-3 shrink-0" />
                        <span className="text-sm">{tip}</span>
                      </li>
                    ))}
                  </ul>
                </CardContent>
              </Card>
            </div>
            
            <div className="flex justify-between pt-4">
              <Button 
                variant="outline"
                onClick={handlePreviousStep}
                className="flex items-center"
              >
                <ChevronLeft className="mr-2 h-4 w-4" />
                Back
              </Button>
              <Button 
                onClick={handleNextStep}
                className="bg-violet-600 hover:bg-violet-700 text-white flex items-center"
              >
                Continue
                <ChevronRight className="ml-2 h-4 w-4" />
              </Button>
            </div>
          </motion.div>
        )
      
      case 2: // Upload
        return (
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-6"
          >
            <div className="text-center">
              <Upload className="h-12 w-12 text-violet-600 mx-auto mb-4" />
              <h3 className="text-xl font-semibold mb-2">Upload Your Video</h3>
              <p className="text-gray-600 max-w-2xl mx-auto">
                Record directly using your webcam or upload an existing video file to create your AI avatar.
              </p>
            </div>
            
            <Card className="max-w-2xl mx-auto">
              <CardContent className="pt-6">
                <div className={`border-2 border-dashed rounded-xl p-8 transition-all ${
                  hasRecordedVideo ? 'border-green-300 bg-green-50' : 'border-gray-300 hover:border-violet-300'
                }`}>
                  {hasRecordedVideo ? (
                    <motion.div 
                      initial={{ scale: 0.8, opacity: 0 }}
                      animate={{ scale: 1, opacity: 1 }}
                      className="text-center"
                    >
                      <CheckCircle2 className="h-16 w-16 text-green-500 mx-auto mb-4" />
                      <h4 className="font-semibold text-lg mb-2">Video Ready!</h4>
                      <p className="text-gray-600 text-sm mb-4">
                        Your video has been successfully uploaded and is ready for processing.
                      </p>
                      <Button 
                        variant="outline" 
                        size="sm"
                        onClick={resetRecording}
                        className="flex items-center"
                      >
                        <X className="h-4 w-4 mr-2" />
                        Reset & Try Again
                      </Button>
                    </motion.div>
                  ) : (
                    <div className="space-y-6">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <Button 
                          className="h-32 flex flex-col bg-white border-2 border-gray-300 hover:border-violet-500 hover:bg-violet-50 text-gray-700 hover:text-violet-700 transition-all"
                          disabled={isRecording || isUploading}
                          onClick={handleStartRecording}
                        >
                          <Webcam className="h-10 w-10 mb-3" />
                          <span className="font-medium">Record with Webcam</span>
                          <span className="text-xs mt-1">Start recording directly</span>
                        </Button>
                        
                        <Button 
                          className="h-32 flex flex-col bg-white border-2 border-gray-300 hover:border-violet-500 hover:bg-violet-50 text-gray-700 hover:text-violet-700 transition-all"
                          disabled={isRecording || isUploading}
                          onClick={handleUploadFile}
                        >
                          <Upload className="h-10 w-10 mb-3" />
                          <span className="font-medium">Upload Video File</span>
                          <span className="text-xs mt-1">MP4, WebM, MOV (max 500MB)</span>
                        </Button>
                      </div>
                      
                      <AnimatePresence>
                        {(isRecording || isUploading) && (
                          <motion.div 
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            className="text-center"
                          >
                            <div className="flex items-center justify-center mb-2">
                              <Loader2 className="h-5 w-5 animate-spin text-violet-600 mr-2" />
                              {isRecording && (
                                <div className="w-3 h-3 rounded-full bg-red-500 animate-pulse mr-2"></div>
                              )}
                            </div>
                            <p className="text-sm text-gray-600">
                              {isRecording ? "Recording in progress..." : "Uploading video..."}
                            </p>
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
            
            <div className="flex justify-between pt-4">
              <Button 
                variant="outline"
                onClick={handlePreviousStep}
                className="flex items-center"
              >
                <ChevronLeft className="mr-2 h-4 w-4" />
                Back
              </Button>
              <Button 
                onClick={handleNextStep}
                className="bg-violet-600 hover:bg-violet-700 text-white flex items-center"
                disabled={!hasRecordedVideo}
              >
                Continue
                <ChevronRight className="ml-2 h-4 w-4" />
              </Button>
            </div>
          </motion.div>
        )
      
      case 3: // Consent & Configuration
        return (
          <motion.div 
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="space-y-6"
          >
            <div className="text-center">
              <Settings className="h-12 w-12 text-violet-600 mx-auto mb-4" />
              <h3 className="text-xl font-semibold mb-2">AI Configuration & Consent</h3>
              <p className="text-gray-600 max-w-2xl mx-auto">
                Configure your AI assistant settings and provide consent for processing.
              </p>
            </div>
            
            <div className="max-w-2xl mx-auto space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center justify-between text-lg">
                    AI Assistant Settings
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={generateAICloneConfig}
                      className="flex items-center"
                    >
                      <Sparkles className="h-4 w-4 mr-1" />
                      Auto-Configure
                    </Button>
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <Label>Assistant Name</Label>
                    <Input
                      value={cloneName}
                      onChange={(e) => setCloneName(e.target.value)}
                      placeholder="e.g., Marketing AI Assistant"
                      className="mt-1"
                    />
                  </div>
                  
                  <div className="space-y-3">
                    {[
                      {
                        key: 'usePersonalizedResponses',
                        label: 'Personalized Responses',
                        description: 'Adapt responses based on audience and context'
                      },
                      {
                        key: 'maintainBrandVoice',
                        label: 'Brand Voice Consistency',
                        description: 'Always maintain your established brand voice and tone'
                      },
                      {
                        key: 'adaptToAudience',
                        label: 'Audience Adaptation',
                        description: 'Adjust communication style for different target audiences'
                      },
                      {
                        key: 'enableLearning',
                        label: 'Continuous Learning',
                        description: 'Learn from successful campaigns and improve over time'
                      }
                    ].map(({ key, label, description }) => (
                      <div key={key} className="flex items-start">
                        <div className="flex items-center h-5 mt-1">
                          <input
                            id={key}
                            type="checkbox"
                            checked={aiConfig[key as keyof typeof aiConfig]}
                            onChange={(e) => setAiConfig({
                              ...aiConfig,
                              [key]: e.target.checked
                            })}
                            className="h-4 w-4 rounded border-gray-300 text-violet-600 focus:ring-violet-500"
                          />
                        </div>
                        <div className="ml-3">
                          <Label htmlFor={key} className="cursor-pointer font-medium">
                            {label}
                          </Label>
                          <p className="text-xs text-gray-500 mt-0.5">{description}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Processing Options</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-3">
                    <div className="flex items-start">
                      <div className="flex items-center h-5 mt-1">
                        <input
                          id="background-removal"
                          type="checkbox"
                          checked={showBackgroundRemoval}
                          onChange={(e) => setShowBackgroundRemoval(e.target.checked)}
                          className="h-4 w-4 rounded border-gray-300 text-violet-600 focus:ring-violet-500"
                        />
                      </div>
                      <div className="ml-3">
                        <Label htmlFor="background-removal" className="cursor-pointer font-medium">
                          Background removal
                        </Label>
                        <p className="text-xs text-gray-500">
                          Automatically remove and replace background in videos
                        </p>
                      </div>
                    </div>
                    
                    <div className="flex items-start">
                      <div className="flex items-center h-5 mt-1">
                        <input
                          id="high-resolution"
                          type="checkbox"
                          checked={useHighResolution}
                          onChange={(e) => setUseHighResolution(e.target.checked)}
                          className="h-4 w-4 rounded border-gray-300 text-violet-600 focus:ring-violet-500"
                        />
                      </div>
                      <div className="ml-3">
                        <Label htmlFor="high-resolution" className="cursor-pointer font-medium">
                          High resolution processing
                        </Label>
                        <p className="text-xs text-gray-500">
                          Process at maximum quality (may increase processing time)
                        </p>
                      </div>
                    </div>
                    
                    <div className="flex items-start">
                      <div className="flex items-center h-5 mt-1">
                        <input
                          id="keep-sound"
                          type="checkbox"
                          checked={keepAmbientSound}
                          onChange={(e) => setKeepAmbientSound(e.target.checked)}
                          className="h-4 w-4 rounded border-gray-300 text-violet-600 focus:ring-violet-500"
                        />
                      </div>
                      <div className="ml-3">
                        <Label htmlFor="keep-sound" className="cursor-pointer font-medium">
                          Keep ambient sound
                        </Label>
                        <p className="text-xs text-gray-500">
                          Preserve background audio from original recording
                        </p>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="border-yellow-200 bg-yellow-50">
                <CardContent className="pt-6">
                  <h4 className="font-medium mb-3 flex items-center">
                    <Info className="h-4 w-4 mr-2 text-yellow-600" />
                    Consent Confirmation
                  </h4>
                  <div className="space-y-2 text-sm text-gray-700">
                    <div className="flex items-start">
                      <Check className="h-4 w-4 text-green-500 mt-0.5 mr-2 shrink-0" />
                      <span>You have rights to use this content for AI assistant creation</span>
                    </div>
                    <div className="flex items-start">
                      <Check className="h-4 w-4 text-green-500 mt-0.5 mr-2 shrink-0" />
                      <span>You consent to AI-powered brand voice replication</span>
                    </div>
                    <div className="flex items-start">
                      <Check className="h-4 w-4 text-green-500 mt-0.5 mr-2 shrink-0" />
                      <span>This is a demo - no actual AI clone will be created</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
            
            <div className="flex justify-between pt-4">
              <Button 
                variant="outline"
                onClick={handlePreviousStep}
                className="flex items-center"
              >
                <ChevronLeft className="mr-2 h-4 w-4" />
                Back
              </Button>
              <Button 
                onClick={handleNextStep}
                className="bg-violet-600 hover:bg-violet-700 text-white flex items-center"
              >
                Confirm & Continue
                <ChevronRight className="ml-2 h-4 w-4" />
              </Button>
            </div>
          </motion.div>
        )
        
      case 4: // Review & Complete
        return (
          <motion.div 
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="space-y-6"
          >
            <div className="text-center">
              <CheckCircle2 className="h-16 w-16 text-green-500 mx-auto mb-4" />
              <h3 className="text-2xl font-semibold mb-2">AI Assistant Ready!</h3>
              <p className="text-gray-600 max-w-2xl mx-auto">
                Your AI marketing assistant has been configured and is ready to help create 
                consistent, on-brand marketing content across all channels.
              </p>
            </div>
            
            <Card className="max-w-2xl mx-auto bg-gradient-to-br from-violet-50 to-indigo-50 border-violet-200">
              <CardContent className="pt-6">
                <div className="text-center">
                  <div className="w-20 h-20 rounded-full bg-violet-100 border-4 border-white shadow-lg mx-auto mb-4 flex items-center justify-center">
                    <Bot className="h-10 w-10 text-violet-600" />
                  </div>
                  
                  <h3 className="text-xl font-semibold mb-2">{cloneName}</h3>
                  <p className="text-gray-600 text-sm mb-6">
                    AI Marketing Assistant configured with your brand voice and personality
                  </p>
                  
                  <div className="grid grid-cols-2 gap-4 mb-6">
                    <div className="bg-white rounded-lg p-3 border">
                      <Monitor className="h-6 w-6 text-violet-600 mx-auto mb-2" />
                      <h4 className="text-sm font-medium mb-1">Avatar Type</h4>
                      <p className="text-xs text-gray-600 capitalize">{avatarType}</p>
                    </div>
                    
                    <div className="bg-white rounded-lg p-3 border">
                      <Users className="h-6 w-6 text-violet-600 mx-auto mb-2" />
                      <h4 className="text-sm font-medium mb-1">Brand Voice</h4>
                      <p className="text-xs text-gray-600">Configured</p>
                    </div>
                  </div>
                  
                  <div className="bg-white rounded-lg p-4 border text-left mb-6">
                    <h4 className="font-medium mb-3 text-center">AI Capabilities</h4>
                    <div className="grid grid-cols-1 gap-2 text-sm">
                      {[
                        'Brand-consistent content generation',
                        'Multi-channel campaign creation',
                        'Audience-adaptive messaging',
                        'Campaign performance optimization'
                      ].map((capability, index) => (
                        <div key={index} className="flex items-center">
                          <Check className="h-4 w-4 text-green-500 mr-2 shrink-0" />
                          <span>{capability}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                  
                  <div className="flex justify-center">
                    {!avatarFinished ? (
                      <Button 
                        className="bg-violet-600 hover:bg-violet-700 text-white"
                        onClick={() => {
                          setAvatarFinished(true)
                          toast({
                            title: "AI Assistant Activated!",
                            description: "Your AI marketing assistant is now ready to help create campaigns."
                          })
                        }}
                      >
                        <Check className="h-4 w-4 mr-2" />
                        Activate Assistant
                      </Button>
                    ) : (
                      <Button
                        className="bg-green-600 hover:bg-green-700 text-white flex items-center"
                        onClick={generateCampaign}
                      >
                        <Sparkles className="h-4 w-4 mr-2" />
                        Start Creating Campaigns
                      </Button>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>

            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 max-w-2xl mx-auto">
              <div className="flex items-start gap-3">
                <Info className="h-5 w-5 text-blue-600 mt-0.5 shrink-0" />
                <div>
                  <h4 className="font-medium text-blue-900 mb-1">What happens next?</h4>
                  <p className="text-sm text-blue-800">
                    Your AI assistant will use all the brand information you've provided - personality traits, 
                    voice guidelines, visual style, and preferences - to create consistent, professional 
                    marketing content across all your campaigns and channels.
                  </p>
                </div>
              </div>
            </div>
          </motion.div>
        )
      
      default:
        return null
    }
  }

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      <div className="text-center">
        <h2 className="text-2xl font-bold text-gray-900 mb-2">AI Marketing Assistant Setup</h2>
        <p className="text-gray-600">
          Configure your AI-powered marketing assistant for consistent brand representation
        </p>
      </div>

      {/* Progress Indicator */}
      <div className="max-w-2xl mx-auto">
        <div className="flex items-center justify-between mb-2">
          <span className="text-sm text-gray-500">
            Step {avatarSetupStep + 1} of {AVATAR_SETUP_STEPS.length}
          </span>
          <span className="text-sm text-gray-500">
            {AVATAR_SETUP_STEPS[avatarSetupStep]}
          </span>
        </div>
        <div className="w-full bg-gray-200 rounded-full h-2">
          <div 
            className="bg-violet-600 h-2 rounded-full transition-all duration-300"
            style={{ width: `${((avatarSetupStep + 1) / AVATAR_SETUP_STEPS.length) * 100}%` }}
          />
        </div>
      </div>

      {/* Main Content */}
      <Card className="border-violet-100">
        <CardContent className="pt-8 pb-8">
          {renderAvatarCreationStep()}
        </CardContent>
      </Card>

      {/* Overall Navigation */}
      <div className="flex justify-between pt-6 border-t">
        <Button onClick={onBack} variant="outline" className="flex items-center">
          <ChevronLeft className="mr-2 h-4 w-4" />
          Back to Style Guide
        </Button>
        
        <div className="text-sm text-gray-500">
          Final step - Almost ready to start creating campaigns!
        </div>
      </div>
    </div>
  )
}