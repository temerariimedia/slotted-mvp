import React, { useState, useEffect } from 'react'
import { Button } from '../ui/button'
import { Badge } from '../ui/badge'
import { Input } from '../ui/input'
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card'
import { 
  X,
  HelpCircle,
  PlusCircle,
  ChevronRight,
  Sliders,
  Hash,
  Sparkles
} from 'lucide-react'
import { TooltipProvider, Tooltip, TooltipTrigger, TooltipContent } from '../ui/tooltip'
import { useSlottedContext } from '../../contexts/SlottedContext'
import { useToast } from '../../hooks/use-toast'

// Custom Slider component
const Slider = ({ value, onValueChange, max = 100, step = 1, className = "" }: {
  value: number[]
  onValueChange: (value: number[]) => void
  max?: number
  step?: number
  className?: string
}) => (
  <div className="relative">
    <input
      type="range"
      min="0"
      max={max}
      step={step}
      value={value[0]}
      onChange={(e) => onValueChange([parseInt(e.target.value)])}
      className={`w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer slider ${className}`}
      style={{
        background: `linear-gradient(to right, #3b82f6 0%, #3b82f6 ${value[0]}%, #e5e7eb ${value[0]}%, #e5e7eb 100%)`
      }}
    />
    <div className="flex justify-between text-xs text-gray-400 mt-1">
      <span>0</span>
      <span className="font-medium text-gray-600">{value[0]}</span>
      <span>{max}</span>
    </div>
  </div>
)

type BrandKeyword = {
  id: number
  text: string
}

interface BrandPersonalityProps {
  onNext: () => void
  onBack?: () => void
}

export default function BrandPersonality({ onNext, onBack }: BrandPersonalityProps) {
  const { context, updateContext } = useSlottedContext()
  const { toast } = useToast()
  
  // Brand Personality Keywords
  const [keywords, setKeywords] = useState<BrandKeyword[]>(
    context.brandDNA?.brandTone?.personality?.map((text, index) => ({ 
      id: index + 1, 
      text 
    })) || [
      { id: 1, text: "Innovative" },
      { id: 2, text: "Trustworthy" },
      { id: 3, text: "Powerful" },
      { id: 4, text: "User-friendly" },
      { id: 5, text: "Efficient" }
    ]
  )
  const [newKeyword, setNewKeyword] = useState("")

  // AI Personality Profile Values
  const [personalityValues, setPersonalityValues] = useState({
    formal: context.aiPersona?.personalityTraits?.includes('formal') ? 70 : 45,
    technical: context.aiPersona?.personalityTraits?.includes('technical') ? 70 : 35,
    serious: context.aiPersona?.personalityTraits?.includes('serious') ? 70 : 40,
    brief: context.aiPersona?.personalityTraits?.includes('brief') ? 75 : 45,
    analytical: context.aiPersona?.personalityTraits?.includes('analytical') ? 70 : 50,
    creative: context.aiPersona?.personalityTraits?.includes('creative') ? 65 : 45,
    strategic: context.aiPersona?.personalityTraits?.includes('strategic') ? 80 : 60,
    collaborative: context.aiPersona?.personalityTraits?.includes('collaborative') ? 60 : 40
  })

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
      }
    })
  }, [personalityValues, keywords])

  // Add and remove keywords
  const addKeyword = () => {
    if (newKeyword.trim() !== "") {
      const updatedKeywords = [...keywords, { id: Date.now(), text: newKeyword }]
      setKeywords(updatedKeywords)
      setNewKeyword("")
      
      toast({
        title: "Keyword added",
        description: `"${newKeyword}" added to brand personality`,
      })
    }
  }

  const removeKeyword = (id: number) => {
    const keywordToRemove = keywords.find(k => k.id === id)
    const updatedKeywords = keywords.filter(kw => kw.id !== id)
    setKeywords(updatedKeywords)
    
    if (keywordToRemove) {
      toast({
        title: "Keyword removed",
        description: `"${keywordToRemove.text}" removed from brand personality`,
      })
    }
  }

  // Handle slider value changes
  const handleSliderChange = (name: string, value: number[]) => {
    setPersonalityValues({
      ...personalityValues,
      [name]: value[0]
    })

    toast({
      title: "Personality updated",
      description: `${name.charAt(0).toUpperCase() + name.slice(1)} trait set to ${value[0]}%`,
      duration: 1500
    })
  }

  // Generate personality suggestions based on industry
  const generatePersonalitySuggestions = () => {
    const industry = context.companyInfo?.industry || context.industry || 'business'
    const suggestions = getIndustrySuggestions(industry)
    
    // Add suggestions that aren't already present
    const currentTexts = keywords.map(k => k.text.toLowerCase())
    const newSuggestions = suggestions.filter(s => !currentTexts.includes(s.toLowerCase()))
    
    if (newSuggestions.length > 0) {
      const updatedKeywords = [
        ...keywords,
        ...newSuggestions.slice(0, 3).map(text => ({ id: Date.now() + Math.random(), text }))
      ]
      setKeywords(updatedKeywords)
      
      toast({
        title: "Personality suggestions added",
        description: `Added ${newSuggestions.slice(0, 3).length} industry-relevant traits`,
      })
    } else {
      toast({
        title: "No new suggestions",
        description: "Your personality profile already covers the key traits for your industry",
      })
    }
  }

  // Get personality suggestions based on industry
  const getIndustrySuggestions = (industry: string): string[] => {
    const industryMap: Record<string, string[]> = {
      'technology': ['Cutting-edge', 'Scalable', 'User-centric', 'Agile', 'Data-driven'],
      'healthcare': ['Caring', 'Precise', 'Reliable', 'Empathetic', 'Professional'],
      'finance': ['Trustworthy', 'Secure', 'Transparent', 'Expert', 'Reliable'],
      'education': ['Knowledgeable', 'Supportive', 'Inspiring', 'Accessible', 'Growth-oriented'],
      'retail': ['Customer-focused', 'Trendy', 'Accessible', 'Quality-driven', 'Value-oriented'],
      'consulting': ['Strategic', 'Insightful', 'Results-oriented', 'Collaborative', 'Expert'],
      'marketing': ['Creative', 'Strategic', 'Data-driven', 'Innovative', 'Results-focused'],
      'default': ['Professional', 'Reliable', 'Customer-focused', 'Quality-driven', 'Results-oriented']
    }

    return industryMap[industry.toLowerCase()] || industryMap['default']
  }

  // Get personality summary
  const getPersonalitySummary = () => {
    const dominantTraits = Object.entries(personalityValues)
      .filter(([_, value]) => value > 60)
      .map(([key, value]) => ({ trait: key, value }))
      .sort((a, b) => b.value - a.value)
      .slice(0, 3)

    return dominantTraits.map(({ trait, value }) => `${trait} (${value}%)`).join(', ')
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="text-center">
        <h2 className="text-2xl font-bold text-gray-900 mb-2">Brand Personality Profile</h2>
        <p className="text-gray-600">
          Define your brand's character traits and communication style to guide AI-powered content generation
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Personality Sliders - Main Content */}
        <div className="lg:col-span-2 space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Sliders className="h-5 w-5 text-blue-600" />
                AI Personality Profile
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger>
                      <HelpCircle className="h-4 w-4 text-blue-600" />
                    </TooltipTrigger>
                    <TooltipContent className="max-w-md">
                      <p>Adjust these sliders to define your brand's personality traits for content generation. Values above 50% will be emphasized in AI-generated content.</p>
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                {[
                  { key: 'formal', left: 'Formal', right: 'Casual', description: 'Professional tone vs. relaxed communication' },
                  { key: 'technical', left: 'Technical', right: 'Simple', description: 'Expert terminology vs. accessible language' },
                  { key: 'serious', left: 'Serious', right: 'Humorous', description: 'Professional demeanor vs. playful approach' },
                  { key: 'brief', left: 'Brief', right: 'Detailed', description: 'Concise messages vs. comprehensive explanations' },
                  { key: 'analytical', left: 'Analytical', right: 'Intuitive', description: 'Data-driven vs. emotion-based communication' },
                  { key: 'creative', left: 'Creative', right: 'Practical', description: 'Innovative ideas vs. proven solutions' },
                  { key: 'strategic', left: 'Strategic', right: 'Tactical', description: 'Big picture thinking vs. specific actions' },
                  { key: 'collaborative', left: 'Collaborative', right: 'Independent', description: 'Team-focused vs. self-reliant messaging' }
                ].map(({ key, left, right, description }) => (
                  <div key={key} className="space-y-3">
                    <div className="flex justify-between items-center">
                      <span className="font-medium text-sm text-gray-700">{left}</span>
                      <span className="font-medium text-sm text-gray-700">{right}</span>
                    </div>
                    <Slider 
                      value={[personalityValues[key as keyof typeof personalityValues]]} 
                      onValueChange={(value) => handleSliderChange(key, value)}
                      max={100} 
                      step={1}
                    />
                    <p className="text-xs text-gray-500">{description}</p>
                  </div>
                ))}
                
                <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
                  <p className="text-xs text-blue-800">
                    <strong>Tip:</strong> Personality traits are used by AI to maintain consistency across all your marketing content. 
                    Values above 50% will be emphasized in content generation.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Brand Keywords - Sidebar */}
        <div className="space-y-6">
          {/* Brand Keywords Section */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-base">
                <Hash className="h-4 w-4 text-purple-600" />
                Brand Keywords
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger>
                      <HelpCircle className="h-4 w-4 text-blue-600" />
                    </TooltipTrigger>
                    <TooltipContent className="max-w-md">
                      <p>Keywords that define your brand's character and emotional attributes. These guide content tone and messaging.</p>
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex flex-wrap gap-2">
                {keywords.map(keyword => (
                  <Badge 
                    key={keyword.id} 
                    variant="outline" 
                    className="py-1.5 px-2.5 text-xs bg-blue-50 border-blue-100 text-blue-700 hover:bg-blue-100"
                  >
                    {keyword.text}
                    <button 
                      onClick={() => removeKeyword(keyword.id)} 
                      className="ml-1.5 text-blue-400 hover:text-blue-600 transition-colors"
                    >
                      <X className="h-3 w-3" />
                    </button>
                  </Badge>
                ))}
              </div>
              
              <div className="space-y-2">
                <div className="flex gap-2">
                  <Input 
                    value={newKeyword}
                    onChange={(e) => setNewKeyword(e.target.value)}
                    placeholder="Add keyword or phrase" 
                    className="text-sm"
                    onKeyPress={(e) => {
                      if (e.key === 'Enter') {
                        addKeyword()
                      }
                    }}
                  />
                  <Button onClick={addKeyword} size="sm" className="shrink-0">
                    <PlusCircle className="h-3 w-3" />
                  </Button>
                </div>
                
                <Button 
                  onClick={generatePersonalitySuggestions}
                  variant="outline" 
                  size="sm" 
                  className="w-full text-xs"
                >
                  <Sparkles className="h-3 w-3 mr-1" />
                  Suggest Keywords
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Personality Summary */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Personality Summary</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div>
                  <Label className="text-xs text-gray-500">Dominant Traits</Label>
                  <p className="text-sm font-medium text-gray-900">
                    {getPersonalitySummary() || 'Balanced personality profile'}
                  </p>
                </div>
                
                <div>
                  <Label className="text-xs text-gray-500">Brand Keywords ({keywords.length})</Label>
                  <div className="flex flex-wrap gap-1 mt-1">
                    {keywords.slice(0, 4).map(keyword => (
                      <Badge key={keyword.id} variant="secondary" className="text-xs">
                        {keyword.text}
                      </Badge>
                    ))}
                    {keywords.length > 4 && (
                      <Badge variant="secondary" className="text-xs">
                        +{keywords.length - 4} more
                      </Badge>
                    )}
                  </div>
                </div>

                <div className="bg-green-50 p-3 rounded-lg border border-green-200">
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                    <span className="text-xs text-green-800 font-medium">Profile Complete</span>
                  </div>
                  <p className="text-xs text-green-700 mt-1">
                    Your brand personality is ready for AI content generation
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
      
      {/* Navigation buttons */}
      <div className="flex justify-between pt-6 border-t">
        {onBack && (
          <Button onClick={onBack} variant="outline">
            Back
          </Button>
        )}
        <div className={!onBack ? 'ml-auto' : ''}>
          <Button 
            onClick={onNext}
            className="flex items-center bg-blue-600 hover:bg-blue-700"
            disabled={keywords.length === 0}
          >
            Continue
            <ChevronRight className="ml-2 h-4 w-4" />
          </Button>
        </div>
      </div>
    </div>
  )
}