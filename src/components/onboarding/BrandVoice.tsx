import React, { useState, useRef, ChangeEvent, useEffect } from 'react'
import { Button } from '../ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card'
import { Badge } from '../ui/badge'
import { Label } from '../ui/label'
import { Input } from '../ui/input'
import { Textarea } from '../ui/textarea'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../ui/tabs'
import { Checkbox } from '../ui/checkbox'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select'
import { 
  TooltipProvider, 
  Tooltip, 
  TooltipTrigger, 
  TooltipContent 
} from '../ui/tooltip'
import { 
  PlusCircle, 
  Info, 
  Check, 
  X, 
  HelpCircle, 
  Smile,
  MessageSquare,
  Target,
  FileType,
  PencilLine,
  Sparkles,
  ChevronLeft,
  ChevronRight,
  AlertCircle,
  Trash2
} from 'lucide-react'
import { motion } from 'framer-motion'
import { useSlottedContext } from '../../contexts/SlottedContext'
import { modernAIOrchestrator } from '../../services/ai/modern-ai-orchestrator'
import { useToast } from '../../hooks/use-toast'

// Custom Slider component since it's not in the UI library
const Slider = ({ value, onValueChange, max = 100, step = 10, className = "" }: {
  value: number[]
  onValueChange: (value: number[]) => void
  max?: number
  step?: number
  className?: string
}) => (
  <input
    type="range"
    min="0"
    max={max}
    step={step}
    value={value[0]}
    onChange={(e) => onValueChange([parseInt(e.target.value)])}
    className={`w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer slider ${className}`}
  />
)

type BrandKeyword = {
  id: number
  text: string
}

type BrandTrait = {
  id: number
  trait: string
  description: string
  dosList: string[]
  dontsList: string[]
}

type ContentPillar = {
  id: number
  name: string
  description: string
  topics: string[]
}

interface BrandVoiceProps {
  onNext: () => void
  onBack: () => void
}

export default function BrandVoice({ onNext, onBack }: BrandVoiceProps) {
  const { context, updateContext } = useSlottedContext()
  const { toast } = useToast()
  const [activeTab, setActiveTab] = useState('mission-statement')
  const [lastSaveTime, setLastSaveTime] = useState(0)
  
  // Content Pillars
  const [contentPillars, setContentPillars] = useState<ContentPillar[]>(
    context.contentPreferences?.contentTypes?.map((type, index) => ({
      id: index + 1,
      name: type,
      description: `Content focused on ${type.toLowerCase()}`,
      topics: []
    })) || []
  )
  
  // AI Personality Profile Values
  const [personalityValues, setPersonalityValues] = useState({
    formal: context.aiPersona?.personalityTraits?.includes('formal') ? 70 : 30,
    technical: context.aiPersona?.personalityTraits?.includes('technical') ? 70 : 30,
    serious: context.aiPersona?.personalityTraits?.includes('serious') ? 70 : 30,
    brief: context.aiPersona?.personalityTraits?.includes('brief') ? 70 : 30,
    analytical: context.aiPersona?.personalityTraits?.includes('analytical') ? 70 : 30,
    creative: context.aiPersona?.personalityTraits?.includes('creative') ? 70 : 30,
    strategic: context.aiPersona?.personalityTraits?.includes('strategic') ? 70 : 30,
    collaborative: context.aiPersona?.personalityTraits?.includes('collaborative') ? 70 : 30
  })
  
  // Brand Personality
  const [keywords, setKeywords] = useState<BrandKeyword[]>(
    context.brandDNA?.brandTone?.personality?.map((trait, index) => ({ 
      id: index + 1, 
      text: trait 
    })) || [
      { id: 1, text: "Innovative" },
      { id: 2, text: "Trustworthy" },
      { id: 3, text: "Powerful" },
      { id: 4, text: "User-friendly" },
      { id: 5, text: "Efficient" }
    ]
  )
  const [newKeyword, setNewKeyword] = useState("")
  
  // Brand Traits and Guidelines
  const [traits, setTraits] = useState<BrandTrait[]>([
    {
      id: 1,
      trait: "Friendly but Professional",
      description: "We are approachable and helpful while maintaining professionalism and expertise",
      dosList: ["Use conversational language", "Provide expert advice", "Be encouraging"],
      dontsList: ["Use overly casual slang", "Be condescending", "Use excessive jargon"]
    },
    {
      id: 2,
      trait: "Clear and Concise",
      description: "We communicate clearly and get to the point quickly",
      dosList: ["Use simple language", "Be direct", "Provide clear next steps"],
      dontsList: ["Use unnecessary words", "Be vague", "Overcomplicate simple concepts"]
    }
  ])
  
  // Mission Statement
  const [missionStatement, setMissionStatement] = useState(
    context.company?.description || "To empower our customers to achieve more through innovative solutions."
  )

  // Update context when values change
  useEffect(() => {
    updateContext({
      aiPersona: {
        ...context.aiPersona,
        personalityTraits: Object.entries(personalityValues)
          .filter(([_, value]) => value > 50)
          .map(([key, _]) => key),
        communicationPattern: context.aiPersona?.communicationPattern || 'professional',
        knowledgeAreas: context.aiPersona?.knowledgeAreas || [],
        constraints: context.aiPersona?.constraints || []
      },
      brandDNA: {
        ...context.brandDNA,
        brandTone: {
          ...context.brandDNA?.brandTone,
          personality: keywords.map(k => k.text),
          voiceAttributes: context.brandDNA?.brandTone?.voiceAttributes || [],
          communicationStyle: context.brandDNA?.brandTone?.communicationStyle || 'conversational'
        }
      },
      contentPreferences: {
        ...context.contentPreferences,
        contentTypes: contentPillars.map(p => p.name),
        styleGuidelines: traits.map(t => `${t.trait}: ${t.description}`)
      }
    })
  }, [personalityValues, keywords, contentPillars, traits])
  
  // Handle slider value changes
  const handleSliderChange = (name: string, value: number[]) => {
    setPersonalityValues({
      ...personalityValues,
      [name]: value[0]
    })

    // Optional: show notification
    const now = Date.now()
    if (now - lastSaveTime > 2000) {
      toast({
        title: "Personality updated",
        description: `${name.charAt(0).toUpperCase() + name.slice(1)} trait updated`
      })
      setLastSaveTime(now)
    }
  }
  
  // Functions for interactivity
  const addKeyword = () => {
    if (newKeyword.trim() !== "") {
      const updatedKeywords = [...keywords, { id: Date.now(), text: newKeyword }]
      setKeywords(updatedKeywords)
      setNewKeyword("")
    }
  }

  const removeKeyword = (id: number) => {
    const updatedKeywords = keywords.filter(kw => kw.id !== id)
    setKeywords(updatedKeywords)
  }
  
  // Utility function to save traits to state
  const saveTraits = (updatedTraits: BrandTrait[]) => {
    setTraits(updatedTraits)
    
    // Show toast notification
    const now = Date.now()
    if (now - lastSaveTime > 2000) {
      toast({
        title: "Changes saved",
        description: "Voice guidelines updated automatically"
      })
      setLastSaveTime(now)
    }
  }

  const addTraitDo = (traitId: number) => {
    const updatedTraits = traits.map(t => {
      if (t.id === traitId) {
        return {
          ...t,
          dosList: [...t.dosList, ""]
        }
      }
      return t
    })
    saveTraits(updatedTraits)
  }
  
  const addTraitDont = (traitId: number) => {
    const updatedTraits = traits.map(t => {
      if (t.id === traitId) {
        return {
          ...t,
          dontsList: [...t.dontsList, ""]
        }
      }
      return t
    })
    saveTraits(updatedTraits)
  }
  
  const removeTraitDo = (traitId: number, index: number) => {
    const updatedTraits = traits.map(t => {
      if (t.id === traitId) {
        const newDos = [...t.dosList]
        newDos.splice(index, 1)
        return {
          ...t,
          dosList: newDos
        }
      }
      return t
    })
    saveTraits(updatedTraits)
  }
  
  const removeTraitDont = (traitId: number, index: number) => {
    const updatedTraits = traits.map(t => {
      if (t.id === traitId) {
        const newDonts = [...t.dontsList]
        newDonts.splice(index, 1)
        return {
          ...t,
          dontsList: newDonts
        }
      }
      return t
    })
    saveTraits(updatedTraits)
  }
  
  const updateTraitDo = (traitId: number, index: number, value: string) => {
    const updatedTraits = traits.map(t => {
      if (t.id === traitId) {
        const newDos = [...t.dosList]
        newDos[index] = value
        return {
          ...t,
          dosList: newDos
        }
      }
      return t
    })
    saveTraits(updatedTraits)
  }
  
  const updateTraitDont = (traitId: number, index: number, value: string) => {
    const updatedTraits = traits.map(t => {
      if (t.id === traitId) {
        const newDonts = [...t.dontsList]
        newDonts[index] = value
        return {
          ...t,
          dontsList: newDonts
        }
      }
      return t
    })
    saveTraits(updatedTraits)
  }
  
  // Add a new trait
  const addNewTrait = () => {
    const newTraitItem = {
      id: Date.now(),
      trait: "New Voice Trait",
      description: "Describe what this trait means for your brand voice",
      dosList: ["Example of what to do"],
      dontsList: ["Example of what not to do"]
    }
    
    saveTraits([...traits, newTraitItem])
  }
  
  // Save mission statement to state
  const saveMissionStatement = () => {
    updateContext({
      company: {
        ...context.company,
        description: missionStatement
      }
    })
    
    toast({
      title: "Mission statement saved",
      description: "Your changes have been saved automatically"
    })
  }
  
  // Tab management
  const handleTabChange = (value: string) => {
    setActiveTab(value)
  }
  
  // Auto-generate topics for a content pillar
  const generateTopics = async (pillarId: number) => {
    toast({
      title: "Generating topics",
      description: "Please wait while AI generates relevant topics..."
    })
    
    try {
      const pillar = contentPillars.find(p => p.id === pillarId)
      if (!pillar) return

      const companyContext = `
        Company: ${context.companyInfo?.companyName || context.companyName || 'Unknown'}
        Industry: ${context.companyInfo?.industry || context.industry || 'Unknown'}
        Content Pillar: ${pillar.name}
        Description: ${pillar.description}
      `

      const prompt = `Generate 5 relevant content topics for this content pillar:

${companyContext}

Return only a JSON array of topic strings, no explanations.
Example: ["Topic 1", "Topic 2", "Topic 3", "Topic 4", "Topic 5"]`

      const response = await modernAIOrchestrator.generateContent({
        prompt,
        context: 'content-topics-generation',
        temperature: 0.7
      })

      const generatedTopics = JSON.parse(response.content)
      
      // Update the content pillar with the new topics
      const updatedPillars = contentPillars.map(pillar => {
        if (pillar.id === pillarId) {
          return {
            ...pillar,
            topics: [...pillar.topics, ...generatedTopics]
          }
        }
        return pillar
      })
      
      setContentPillars(updatedPillars)
      
      toast({
        title: "Topics generated",
        description: `Added ${generatedTopics.length} new topics to this content pillar`
      })
    } catch (error) {
      console.error('Error generating topics:', error)
      toast({
        title: "Error generating topics",
        description: "Please try again or add topics manually"
      })
    }
  }
  
  // Generate a new content pillar and description
  const generatePillar = async () => {
    toast({
      title: "Generating content pillar",
      description: "Please wait while AI creates a relevant content pillar..."
    })
    
    try {
      const companyContext = `
        Company: ${context.companyInfo?.companyName || context.companyName || 'Unknown'}
        Industry: ${context.companyInfo?.industry || context.industry || 'Unknown'}
        Brand Keywords: ${keywords.map(k => k.text).join(', ')}
      `

      const prompt = `Create a new content pillar for this company:

${companyContext}

Return a JSON object with:
{
  "name": "Content Pillar Name",
  "description": "Brief description of this content pillar",
  "topics": ["Topic 1", "Topic 2", "Topic 3"]
}

Make it relevant to the company's industry and brand personality.`

      const response = await modernAIOrchestrator.generateContent({
        prompt,
        context: 'content-pillar-generation',
        temperature: 0.7
      })

      const pillarData = JSON.parse(response.content)
      const newPillarData = {
        id: Date.now(),
        name: pillarData.name,
        description: pillarData.description,
        topics: pillarData.topics || []
      }
      
      const updatedPillars = [...contentPillars, newPillarData]
      setContentPillars(updatedPillars)
      
      toast({
        title: "Content pillar generated",
        description: "A new content pillar has been added to your strategy"
      })
    } catch (error) {
      console.error('Error generating pillar:', error)
      // Fallback to manual creation
      const newPillarData = {
        id: Date.now(),
        name: `Content Pillar ${contentPillars.length + 1}`,
        description: "Generated content focused on your brand's unique value",
        topics: ["Topic 1", "Topic 2", "Topic 3"]
      }
      
      const updatedPillars = [...contentPillars, newPillarData]
      setContentPillars(updatedPillars)
      
      toast({
        title: "Content pillar created",
        description: "A new content pillar has been added to your strategy"
      })
    }
  }
  
  return (
    <div className="max-w-6xl mx-auto space-y-6">
      <div className="text-center">
        <h2 className="text-2xl font-bold text-gray-900 mb-2">Brand Voice & Style</h2>
        <p className="text-gray-600">
          Define your brand's personality, communication style, and content strategy
        </p>
      </div>

      <div className="mt-6">
        <Tabs defaultValue="mission-statement" value={activeTab} onValueChange={handleTabChange} className="w-full">
          <TabsList className="grid grid-cols-4 mb-8 p-1 bg-gray-50 rounded-xl">
            <TabsTrigger 
              value="mission-statement" 
              className="flex items-center gap-2 data-[state=active]:bg-white data-[state=active]:text-blue-600 data-[state=active]:shadow-md transition-all duration-200 py-3"
            >
              <div className="rounded-full bg-blue-50 p-1.5 text-blue-600">
                <FileType className="h-4 w-4" />
              </div>
              <span className="hidden md:inline font-medium">Mission Statement</span>
              <span className="inline md:hidden font-medium">Mission</span>
            </TabsTrigger>
            <TabsTrigger 
              value="brand-personality" 
              className="flex items-center gap-2 data-[state=active]:bg-white data-[state=active]:text-blue-600 data-[state=active]:shadow-md transition-all duration-200 py-3"
            >
              <div className="rounded-full bg-blue-50 p-1.5 text-blue-600">
                <Smile className="h-4 w-4" />
              </div>
              <span className="hidden md:inline font-medium">Brand Personality</span>
              <span className="inline md:hidden font-medium">Personality</span>
            </TabsTrigger>
            <TabsTrigger 
              value="voice-guidelines" 
              className="flex items-center gap-2 data-[state=active]:bg-white data-[state=active]:text-blue-600 data-[state=active]:shadow-md transition-all duration-200 py-3"
            >
              <div className="rounded-full bg-blue-50 p-1.5 text-blue-600">
                <MessageSquare className="h-4 w-4" />
              </div>
              <span className="hidden md:inline font-medium">Voice Guidelines</span>
              <span className="inline md:hidden font-medium">Guidelines</span>
            </TabsTrigger>
            <TabsTrigger 
              value="content-pillars" 
              className="flex items-center gap-2 data-[state=active]:bg-white data-[state=active]:text-blue-600 data-[state=active]:shadow-md transition-all duration-200 py-3"
            >
              <div className="rounded-full bg-blue-50 p-1.5 text-blue-600">
                <Target className="h-4 w-4" />
              </div>
              <span className="hidden md:inline font-medium">Content Pillars</span>
              <span className="inline md:hidden font-medium">Pillars</span>
            </TabsTrigger>
          </TabsList>
          
          {/* Mission Statement Tab */}
          <TabsContent value="mission-statement" className="space-y-6">
            <div className="space-y-4">
              <div className="flex items-center space-x-2 mb-4">
                <h3 className="font-medium text-lg">Define Your Mission Statement</h3>
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger>
                      <HelpCircle className="h-4 w-4 text-blue-600" />
                    </TooltipTrigger>
                    <TooltipContent className="max-w-md">
                      <p>Your mission statement summarizes your organization's purpose, goals, and values in a concise way.</p>
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              </div>
              
              <Card className="bg-white border border-gray-200">
                <CardContent className="p-6">
                  <div className="flex flex-col space-y-4">
                    <div>
                      <Label htmlFor="mission-statement" className="text-sm font-medium mb-2 block">Mission Statement</Label>
                      <Textarea 
                        id="mission-statement"
                        placeholder="Enter your mission statement here..."
                        value={missionStatement}
                        onChange={(e) => setMissionStatement(e.target.value)}
                        className="min-h-[120px] resize-none"
                      />
                    </div>
                    
                    <div className="text-sm text-gray-600">
                      <h4 className="font-medium mb-1">Tips for a strong mission statement:</h4>
                      <ul className="space-y-1 list-disc pl-5">
                        <li>Keep it concise and focused</li>
                        <li>Clearly state what you do and why you do it</li>
                        <li>Use clear, jargon-free language</li>
                        <li>Reflect your brand's unique value proposition</li>
                        <li>Ensure it resonates with your target audience</li>
                      </ul>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
            
            {/* Navigation buttons */}
            <div className="w-full flex justify-end pt-6">
              <div>
                <Button 
                  onClick={() => {
                    saveMissionStatement()
                    handleTabChange('brand-personality')
                  }}
                  className="flex items-center bg-blue-600 hover:bg-blue-700"
                >
                  Next: Brand Personality
                  <ChevronRight className="ml-2 h-4 w-4" />
                </Button>
              </div>
            </div>
          </TabsContent>

          {/* Brand Personality Tab */}
          <TabsContent value="brand-personality" className="space-y-6">
            <div className="space-y-6">
              <div>
                <div className="flex items-center space-x-2 mb-6">
                  <h3 className="font-medium text-lg">Personality Profile</h3>
                  <TooltipProvider>
                    <Tooltip>
                      <TooltipTrigger>
                        <HelpCircle className="h-4 w-4 text-blue-600" />
                      </TooltipTrigger>
                      <TooltipContent className="max-w-md">
                        <p>Adjust these sliders to define your brand's personality traits for content generation.</p>
                      </TooltipContent>
                    </Tooltip>
                  </TooltipProvider>
                </div>
                
                <div className="bg-slate-50 p-6 rounded-lg space-y-7">
                  {/* Personality Sliders */}
                  {[
                    { key: 'formal', left: 'Formal', right: 'Casual' },
                    { key: 'technical', left: 'Technical', right: 'Simple' },
                    { key: 'serious', left: 'Serious', right: 'Humorous' },
                    { key: 'brief', left: 'Brief', right: 'Detailed' },
                    { key: 'analytical', left: 'Analytical', right: 'Intuitive' },
                    { key: 'creative', left: 'Creative', right: 'Practical' },
                    { key: 'strategic', left: 'Strategic', right: 'Tactical' },
                    { key: 'collaborative', left: 'Collaborative', right: 'Independent' }
                  ].map(({ key, left, right }) => (
                    <div key={key} className="space-y-2">
                      <div className="flex justify-between mb-1">
                        <span className="font-medium text-sm">{left}</span>
                        <span className="font-medium text-sm">{right}</span>
                      </div>
                      <Slider 
                        value={[personalityValues[key as keyof typeof personalityValues]]} 
                        onValueChange={(value) => handleSliderChange(key, value)}
                        max={100} 
                        step={10}
                        className="cursor-pointer"
                      />
                      <div className="flex justify-between px-1 mt-1">
                        {Array.from({ length: 11 }, (_, i) => (
                          <span key={i} className="w-1 h-2.5 bg-gray-500 rounded"></span>
                        ))}
                      </div>
                    </div>
                  ))}
                  
                  <p className="text-xs text-gray-500 pt-2">Personality traits are determined based on your selected communication style and custom instructions.</p>
                </div>
              </div>
              
              {/* Brand Keywords Section */}
              <div className="space-y-4 mt-6">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="font-medium text-lg">Brand Keywords or Keyword Phrases</h3>
                  <TooltipProvider>
                    <Tooltip>
                      <TooltipTrigger>
                        <HelpCircle className="h-4 w-4 text-blue-600" />
                      </TooltipTrigger>
                      <TooltipContent className="max-w-md">
                        <p>These keywords help define your brand's character and emotional attributes.</p>
                      </TooltipContent>
                    </Tooltip>
                  </TooltipProvider>
                </div>
                
                <div className="flex flex-wrap gap-2 mb-4">
                  {keywords.map(keyword => (
                    <Badge 
                      key={keyword.id} 
                      variant="outline" 
                      className="py-2 px-3 text-sm bg-blue-50 border-blue-100 text-blue-600 hover:bg-blue-100 cursor-default"
                    >
                      {keyword.text}
                      <button onClick={() => removeKeyword(keyword.id)} className="ml-2 text-blue-400 hover:text-blue-600">
                        <X className="h-3 w-3" />
                      </button>
                    </Badge>
                  ))}
                </div>
                
                <div className="flex">
                  <Input 
                    value={newKeyword}
                    onChange={(e) => setNewKeyword(e.target.value)}
                    placeholder="Add keyword or phrase" 
                    className="flex-1 mr-2"
                    onKeyPress={(e) => {
                      if (e.key === 'Enter') {
                        addKeyword()
                      }
                    }}
                  />
                  <Button onClick={addKeyword} variant="default" className="shrink-0">
                    <PlusCircle className="h-4 w-4 mr-2" />
                    Add
                  </Button>
                </div>
              </div>
            </div>
            
            {/* Navigation buttons */}
            <div className="w-full flex justify-end pt-6">
              <div>
                <Button 
                  onClick={() => handleTabChange('voice-guidelines')}
                  className="flex items-center bg-blue-600 hover:bg-blue-700"
                >
                  Next: Voice Guidelines
                  <ChevronRight className="ml-2 h-4 w-4" />
                </Button>
              </div>
            </div>
          </TabsContent>
          
          {/* Voice Guidelines Tab */}
          <TabsContent value="voice-guidelines" className="space-y-6">
            <div className="space-y-4">
              <div className="border border-gray-200 rounded-lg p-6 mb-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  <div>
                    <div className="flex items-center mb-3">
                      <Check className="h-4 w-4 text-green-500 mr-2" />
                      <span className="font-medium">Do</span>
                    </div>
                    
                    <div className="space-y-3">
                      {traits.length > 0 && traits[0].dosList.map((doItem, doIndex) => (
                        <div className="flex items-center" key={`do-${doIndex}`}>
                          <div className="border border-gray-200 rounded flex-1 flex items-center relative">
                            <Input 
                              value={doItem} 
                              className="text-sm bg-white border-0 focus-visible:ring-0 focus-visible:ring-offset-0"
                              onChange={(e) => updateTraitDo(traits[0].id, doIndex, e.target.value)}
                            />
                            <Button 
                              variant="ghost" 
                              size="sm" 
                              className="h-8 w-8 p-0 absolute right-1"
                              onClick={() => removeTraitDo(traits[0].id, doIndex)}
                            >
                              <X className="h-4 w-4 text-red-400" />
                            </Button>
                          </div>
                        </div>
                      ))}
                    </div>
                    
                    <Button 
                      variant="outline" 
                      size="sm" 
                      className="mt-3 flex items-center"
                      onClick={() => addTraitDo(traits[0]?.id || 1)}
                    >
                      <PlusCircle className="h-4 w-4 mr-2" /> Add Do
                    </Button>
                  </div>
                  
                  <div>
                    <div className="flex items-center mb-3">
                      <X className="h-4 w-4 text-red-500 mr-2" />
                      <span className="font-medium">Don't</span>
                    </div>
                    
                    <div className="space-y-3">
                      {traits.length > 0 && traits[0].dontsList.map((dontItem, dontIndex) => (
                        <div className="flex items-center" key={`dont-${dontIndex}`}>
                          <div className="border border-gray-200 rounded flex-1 flex items-center relative">
                            <Input 
                              value={dontItem} 
                              className="text-sm bg-white border-0 focus-visible:ring-0 focus-visible:ring-offset-0"
                              onChange={(e) => updateTraitDont(traits[0].id, dontIndex, e.target.value)}
                            />
                            <Button 
                              variant="ghost" 
                              size="sm" 
                              className="h-8 w-8 p-0 absolute right-1"
                              onClick={() => removeTraitDont(traits[0].id, dontIndex)}
                            >
                              <X className="h-4 w-4 text-red-400" />
                            </Button>
                          </div>
                        </div>
                      ))}
                    </div>
                    
                    <Button 
                      variant="outline" 
                      size="sm" 
                      className="mt-3 flex items-center"
                      onClick={() => addTraitDont(traits[0]?.id || 1)}
                    >
                      <PlusCircle className="h-4 w-4 mr-2" /> Add Don't
                    </Button>
                  </div>
                </div>
              </div>
            </div>

            {/* Navigation buttons */}
            <div className="w-full flex justify-between pt-6">
              <div>
                <Button 
                  variant="outline"
                  onClick={() => handleTabChange('brand-personality')}
                  className="flex items-center"
                >
                  <ChevronLeft className="mr-2 h-4 w-4" />
                  Back: Brand Personality
                </Button>
              </div>
              <div>
                <Button 
                  onClick={() => handleTabChange('content-pillars')}
                  className="flex items-center bg-blue-600 hover:bg-blue-700"
                >
                  Next: Content Pillars
                  <ChevronRight className="ml-2 h-4 w-4" />
                </Button>
              </div>
            </div>
          </TabsContent>
          
          {/* Content Pillars Tab */}
          <TabsContent value="content-pillars" className="space-y-6">
            <div className="space-y-4">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center space-x-2">
                  <h3 className="font-medium text-lg">Content Pillars</h3>
                  <TooltipProvider>
                    <Tooltip>
                      <TooltipTrigger>
                        <HelpCircle className="h-4 w-4 text-blue-600" />
                      </TooltipTrigger>
                      <TooltipContent className="max-w-md">
                        <p>Core themes that will guide your content creation. Content pillars help maintain consistency and focus in your marketing efforts.</p>
                      </TooltipContent>
                    </Tooltip>
                  </TooltipProvider>
                </div>
                
                <Button 
                  variant="default" 
                  size="sm" 
                  className="flex items-center"
                  onClick={generatePillar}
                >
                  <Sparkles className="mr-2 h-4 w-4" />
                  Generate Pillar
                </Button>
              </div>
              
              {contentPillars.length === 0 ? (
                <div className="flex flex-col items-center justify-center p-12 border border-dashed border-gray-300 rounded-lg bg-gray-50">
                  <Target className="h-12 w-12 text-blue-400 mb-4" />
                  <h3 className="font-medium text-lg text-gray-700 mb-2">No Content Pillars Added</h3>
                  <p className="text-gray-500 text-center max-w-md mb-4">Content pillars are the core themes that guide your content strategy and help you maintain consistency.</p>
                  <Button 
                    variant="default" 
                    onClick={generatePillar}
                    className="flex items-center"
                  >
                    <Sparkles className="mr-2 h-4 w-4" />
                    Generate Your First Pillar
                  </Button>
                </div>
              ) : (
                <div className="space-y-6">
                  {contentPillars.map((pillar) => (
                    <Card key={pillar.id} className="bg-white border border-gray-200">
                      <CardContent className="p-6">
                        <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4">
                          <div className="flex-1">
                            <h4 className="font-medium text-blue-700 text-lg mb-1">
                              {pillar.name}
                            </h4>
                            <p className="text-gray-600 mb-4">{pillar.description}</p>
                            
                            {pillar.topics.length > 0 && (
                              <div className="space-y-2">
                                <h5 className="text-sm font-medium">Topics:</h5>
                                <div className="flex flex-wrap gap-2">
                                  {pillar.topics.map((topic, index) => (
                                    <Badge key={`${pillar.id}-topic-${index}`} variant="secondary" className="py-1 px-2">
                                      {topic}
                                    </Badge>
                                  ))}
                                </div>
                              </div>
                            )}
                          </div>
                          
                          <div className="flex flex-col items-center space-y-2">
                            <Button 
                              variant="outline" 
                              size="sm" 
                              className="w-full flex items-center"
                              onClick={() => generateTopics(pillar.id)}
                            >
                              <Sparkles className="mr-2 h-3 w-3" />
                              Generate Topics
                            </Button>
                            <Button 
                              variant="ghost" 
                              size="sm" 
                              className="w-full flex items-center text-red-500 hover:text-red-700 hover:bg-red-50"
                              onClick={() => {
                                const updatedPillars = contentPillars.filter(p => p.id !== pillar.id)
                                setContentPillars(updatedPillars)
                              }}
                            >
                              <Trash2 className="mr-2 h-3 w-3" />
                              Remove
                            </Button>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}
            </div>
            
            {/* Navigation buttons */}
            <div className="w-full flex justify-between pt-6">
              <div>
                <Button 
                  variant="outline"
                  onClick={() => handleTabChange('voice-guidelines')}
                  className="flex items-center"
                >
                  <ChevronLeft className="mr-2 h-4 w-4" />
                  Back: Voice Guidelines
                </Button>
              </div>
              <div>
                <Button 
                  onClick={onNext}
                  className="flex items-center bg-blue-600 hover:bg-blue-700"
                >
                  Continue
                  <ChevronRight className="ml-2 h-4 w-4" />
                </Button>
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </div>

      {/* Overall Navigation */}
      <div className="flex justify-between pt-6 border-t">
        <Button onClick={onBack} variant="outline">
          Back
        </Button>
        <Button 
          onClick={onNext}
          disabled={!missionStatement.trim() || keywords.length === 0}
        >
          Continue
        </Button>
      </div>
    </div>
  )
}