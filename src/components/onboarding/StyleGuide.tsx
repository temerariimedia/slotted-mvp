import React, { useState, useEffect, useRef } from 'react'
import { Button } from '../ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card'
import { Badge } from '../ui/badge'
import { Label } from '../ui/label'
import { Input } from '../ui/input'
import { Textarea } from '../ui/textarea'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../ui/tabs'
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
  Upload, 
  Trash2, 
  Palette, 
  Maximize, 
  Layers, 
  Sparkles, 
  Layout, 
  FileText,
  AlignLeft, 
  AlignCenter, 
  FileType,
  Download,
  ImageIcon, 
  AlertCircle, 
  FileImage, 
  CheckCircle2, 
  Plus,
  ChevronLeft, 
  ChevronRight,
  Wand2
} from 'lucide-react'
import { motion } from 'framer-motion'
import { useSlottedContext } from '../../contexts/SlottedContext'
import { useToast } from '../../hooks/use-toast'
import { modernAIOrchestrator } from '../../services/ai/modern-ai-orchestrator'

// Font preview component
const FontPreview = ({ fontFamily, text = "How quickly daft jumping zebras vex." }: { 
  fontFamily: string
  text?: string 
}) => {
  return (
    <div className="p-4 rounded-md bg-gray-50 border" style={{ fontFamily }}>
      <div className="text-2xl font-semibold mb-2">{text}</div>
      <div className="text-sm mt-1 text-gray-600">ABCDEFGHIJKLMNOPQRSTUVWXYZ</div>
      <div className="text-sm text-gray-600">abcdefghijklmnopqrstuvwxyz</div>
      <div className="text-sm text-gray-600">0123456789</div>
    </div>
  )
}

// Font options
const fontOptions = [
  { value: 'Inter', label: 'Inter' },
  { value: 'Roboto', label: 'Roboto' },
  { value: 'Open Sans', label: 'Open Sans' },
  { value: 'Lato', label: 'Lato' },
  { value: 'Montserrat', label: 'Montserrat' },
  { value: 'Source Sans Pro', label: 'Source Sans Pro' },
  { value: 'Oswald', label: 'Oswald' },
  { value: 'Raleway', label: 'Raleway' },
  { value: 'PT Sans', label: 'PT Sans' },
  { value: 'Lora', label: 'Lora' },
  { value: 'Playfair Display', label: 'Playfair Display' },
  { value: 'Merriweather', label: 'Merriweather' },
  { value: 'Nunito', label: 'Nunito' },
  { value: 'Work Sans', label: 'Work Sans' }
]

interface LogoVariant {
  type: 'horizontal' | 'vertical' | 'symbol' | 'pattern' | 'white-horizontal' | 'white-vertical'
  imageUrl: string
}

interface StyleExample {
  id: string
  type: 'image' | 'text' | 'video'
  url?: string
  content?: string
  notes?: string
  isPositive: boolean
}

interface StyleGuideProps {
  onNext: () => void
  onBack: () => void
}

export default function StyleGuide({ onNext, onBack }: StyleGuideProps) {
  const { context, updateContext } = useSlottedContext()
  const { toast } = useToast()
  const [activeTab, setActiveTab] = useState('brand-colors')
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false)

  // Colors
  const [colors, setColors] = useState({
    primary: context.brandDNA?.brandColors?.primary || '#2563EB',
    secondary: context.brandDNA?.brandColors?.secondary || '#10B981',
    accent: context.brandDNA?.brandColors?.accent || '#F59E0B',
    neutral: '#6B7280',
    background: '#FFFFFF',
    text: '#111827',
    success: '#10B981',
    warning: '#F59E0B',
    error: '#EF4444',
    info: '#3B82F6',
  })

  // Logo variables
  const [logo, setLogo] = useState({
    primaryLogo: '',
    logoVariants: [
      { type: 'horizontal' as const, imageUrl: '' },
      { type: 'vertical' as const, imageUrl: '' },
      { type: 'symbol' as const, imageUrl: '' },
      { type: 'pattern' as const, imageUrl: '' },
      { type: 'white-horizontal' as const, imageUrl: '' },
      { type: 'white-vertical' as const, imageUrl: '' }
    ],
    minimumSize: '24px',
    clearSpace: false,
    usage: '',
  })

  // Typography
  const [typography, setTypography] = useState({
    primaryFont: 'Inter',
    secondaryFont: 'Playfair Display',
    bodyFont: 'Inter',
    customFonts: [] as string[],
    baseSize: '16px',
    scaleRatio: '1.250',
    h1: {
      size: '2.5rem',
      weight: '700',
      lineHeight: '1.2',
      letterSpacing: '0',
      font: '',
    },
    body: {
      size: '1rem',
      weight: '400',
      lineHeight: '1.5',
      letterSpacing: '0',
    }
  })
  
  // Style Training Examples
  const [styleExamples, setStyleExamples] = useState<StyleExample[]>([])
  const [testPrompt, setTestPrompt] = useState("Write a short product announcement for our new service.")
  const [generatedContent, setGeneratedContent] = useState("")
  const [isGenerating, setIsGenerating] = useState(false)

  // Update context when values change
  useEffect(() => {
    updateContext({
      brandDNA: {
        ...context.brandDNA,
        brandColors: {
          primary: colors.primary,
          secondary: colors.secondary,
          accent: colors.accent
        }
      },
      contentPreferences: {
        ...context.contentPreferences,
        styleGuidelines: [
          `Primary Font: ${typography.primaryFont}`,
          `Secondary Font: ${typography.secondaryFont}`,
          `Body Font: ${typography.bodyFont}`,
          `Logo Usage: ${logo.usage || 'Standard brand guidelines apply'}`
        ]
      }
    })
  }, [colors, typography, logo])

  // Function to handle tab changes
  const handleTabChange = (value: string) => {
    if (hasUnsavedChanges) {
      const confirm = window.confirm("You have unsaved changes. Do you want to continue without saving?")
      if (!confirm) return
    }
    
    setActiveTab(value)
    setHasUnsavedChanges(false)
  }

  // Function to handle color changes with auto-save
  const handleColorChange = (colorName: string, value: string) => {
    const updatedColors = { ...colors, [colorName]: value }
    setColors(updatedColors)
    
    toast({
      title: "Color updated",
      description: `${colorName.charAt(0).toUpperCase() + colorName.slice(1)} color changed`,
      duration: 1500
    })
  }

  // Function to handle reset colors with auto-save
  const handleResetColors = () => {
    const defaultColors = {
      primary: '#2563EB',
      secondary: '#10B981',
      accent: '#F59E0B',
      neutral: '#6B7280',
      background: '#FFFFFF',
      text: '#111827',
      success: '#10B981',
      warning: '#F59E0B',
      error: '#EF4444',
      info: '#3B82F6',
    }
    
    setColors(defaultColors)
    
    toast({
      title: "Colors reset",
      description: "All colors have been reset to defaults"
    })
  }

  // Function to handle font selection
  const handleFontChange = (fontName: string, typeKey: string) => {
    setTypography(prev => ({
      ...prev,
      [typeKey]: fontName
    }))
    setHasUnsavedChanges(true)
    
    toast({
      title: "Font updated",
      description: `${typeKey.charAt(0).toUpperCase() + typeKey.slice(1)} font changed to ${fontName}`,
      duration: 1500
    })
  }

  // Handle logo variant upload
  const handleLogoVariantUpload = (variantType: string) => {
    const input = document.createElement('input')
    input.type = 'file'
    input.accept = 'image/*'
    
    input.onchange = (e: Event) => {
      const target = e.target as HTMLInputElement
      if (!target.files || target.files.length === 0) return
      
      const file = target.files[0]
      const reader = new FileReader()
      
      reader.onloadend = () => {
        const updatedVariants = logo.logoVariants.map((v) => 
          v.type === variantType ? {...v, imageUrl: reader.result as string} : v
        )
        
        setLogo(prev => ({
          ...prev,
          logoVariants: updatedVariants
        }))
        setHasUnsavedChanges(true)
        
        toast({
          title: "Logo uploaded",
          description: `${variantType} logo variant has been uploaded`
        })
      }
      
      reader.readAsDataURL(file)
    }
    
    input.click()
  }

  // Generate AI-powered test content
  const generateTestContent = async () => {
    if (!testPrompt.trim()) return

    setIsGenerating(true)
    try {
      const brandContext = `
        Brand Colors: Primary ${colors.primary}, Secondary ${colors.secondary}, Accent ${colors.accent}
        Typography: Primary Font ${typography.primaryFont}, Secondary Font ${typography.secondaryFont}
        Brand Personality: ${context.brandDNA?.brandTone?.personality?.join(', ') || 'Professional'}
        Communication Style: ${context.brandDNA?.brandTone?.communicationStyle || 'Conversational'}
        Company: ${context.companyInfo?.companyName || context.companyName || 'Your Company'}
        Industry: ${context.companyInfo?.industry || context.industry || 'Business'}
      `

      const prompt = `Using this brand context, ${testPrompt}

Brand Context:
${brandContext}

Generate content that matches the brand voice, personality, and style guidelines. Keep it concise and on-brand.`

      const response = await modernAIOrchestrator.generateContent({
        prompt,
        context: 'style-guide-test',
        temperature: 0.7
      })

      setGeneratedContent(response.content)
      
      toast({
        title: "Test content generated",
        description: "Review the generated content for style consistency"
      })
    } catch (error) {
      console.error('Error generating test content:', error)
      toast({
        title: "Generation failed",
        description: "Please try again or check your connection"
      })
    } finally {
      setIsGenerating(false)
    }
  }

  // Generate logo usage guidelines
  const generateLogoGuidelines = () => {
    const guidelines = `1. Always maintain the logo's proportions when resizing
2. Keep the logo clear space equal to the height of the logo's main element
3. Use the appropriate logo version for different backgrounds
4. For digital use, use the PNG format with transparency
5. For print materials, use vector formats (SVG, AI, EPS) whenever possible
6. Never distort, recolor, or add effects to the logo without approval
7. Maintain minimum size of ${logo.minimumSize} for legibility
8. Use white versions on dark backgrounds for optimal contrast`

    setLogo(prev => ({ ...prev, usage: guidelines }))
    
    toast({
      title: "Guidelines generated",
      description: "Logo usage guidelines have been auto-generated"
    })
  }

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      <div className="text-center">
        <h2 className="text-2xl font-bold text-gray-900 mb-2">Visual Style Guide</h2>
        <p className="text-gray-600">
          Define your brand's visual identity, colors, typography, and style elements for consistent marketing materials
        </p>
      </div>

      <Card>
        <CardContent className="pt-6">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-xl font-semibold">Complete Your Brand Style Guide</h3>
          </div>
          <p className="text-gray-600 mb-4">
            A comprehensive style guide ensures your brand maintains consistency across all marketing materials. 
            Define your visual identity elements below to create clear guidelines for your team and partners.
          </p>
          
          <ul className="space-y-2 text-sm">
            <li className="flex items-start gap-2">
              <CheckCircle2 className="h-5 w-5 text-green-500 shrink-0 mt-0.5" />
              <span>Define your brand colors, typography, and visual elements in one place</span>
            </li>
            <li className="flex items-start gap-2">
              <CheckCircle2 className="h-5 w-5 text-green-500 shrink-0 mt-0.5" />
              <span>Ensure consistency across all marketing materials and channels</span>
            </li>
            <li className="flex items-start gap-2">
              <CheckCircle2 className="h-5 w-5 text-green-500 shrink-0 mt-0.5" />
              <span>Provide clear guidelines for designers, content creators, and marketing partners</span>
            </li>
          </ul>
        </CardContent>
      </Card>
      
      <Tabs defaultValue="brand-colors" value={activeTab} onValueChange={handleTabChange} className="w-full">
        <TabsList className="grid grid-cols-4 mb-6">
          <TabsTrigger value="brand-colors" className="flex items-center gap-2">
            <Palette className="h-4 w-4" />
            Colors
          </TabsTrigger>
          <TabsTrigger value="logo" className="flex items-center gap-2">
            <ImageIcon className="h-4 w-4" />
            Elements
          </TabsTrigger>
          <TabsTrigger value="typography" className="flex items-center gap-2">
            <FileType className="h-4 w-4" />
            Typography
          </TabsTrigger>
          <TabsTrigger value="style-training" className="flex items-center gap-2">
            <Sparkles className="h-4 w-4" />
            AI Training
          </TabsTrigger>
        </TabsList>
        
        {/* Brand Colors Tab */}
        <TabsContent value="brand-colors" className="space-y-6">
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="font-medium text-lg flex items-center gap-2">
                Brand Colors 
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger>
                      <HelpCircle className="h-4 w-4 text-blue-600" />
                    </TooltipTrigger>
                    <TooltipContent className="max-w-md">
                      <p>Choose colors that reflect your brand personality and ensure they work well together. Primary colors should be your main brand colors, while secondary and accent colors provide visual interest and highlight important elements.</p>
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              </h3>
              <Button
                variant="outline"
                size="sm"
                onClick={handleResetColors}
              >
                Reset to Defaults
              </Button>
            </div>
            
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div className="space-y-4">
                {[
                  { key: 'primary', label: 'Primary Color', description: 'Your main brand color' },
                  { key: 'secondary', label: 'Secondary Color', description: 'Supporting brand color' },
                  { key: 'accent', label: 'Accent Color', description: 'For highlights and CTAs' },
                  { key: 'neutral', label: 'Neutral Color', description: 'For text and backgrounds' }
                ].map(({ key, label, description }) => (
                  <div key={key}>
                    <div className="flex justify-between items-center mb-2">
                      <div>
                        <Label className="text-sm font-medium">{label}</Label>
                        <p className="text-xs text-gray-500">{description}</p>
                      </div>
                      <span className="text-xs text-gray-500 font-mono">
                        {colors[key as keyof typeof colors]}
                      </span>
                    </div>
                    <div className="flex gap-3 items-center">
                      <div 
                        className="h-12 w-12 rounded-lg border-2 border-gray-200 shadow-sm" 
                        style={{ backgroundColor: colors[key as keyof typeof colors] }}
                      />
                      <Input 
                        type="color" 
                        value={colors[key as keyof typeof colors]} 
                        onChange={(e) => handleColorChange(key, e.target.value)}
                        className="w-20 h-12 border-2"
                      />
                      <Input 
                        type="text" 
                        value={colors[key as keyof typeof colors]} 
                        onChange={(e) => handleColorChange(key, e.target.value)}
                        className="flex-1 font-mono text-sm"
                        placeholder="#000000"
                      />
                    </div>
                  </div>
                ))}
              </div>

              <div className="space-y-4">
                <Card>
                  <CardHeader>
                    <CardTitle className="text-base">Color Palette Preview</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      {['primary', 'secondary', 'accent'].map((colorKey) => (
                        <div key={colorKey} className="space-y-2">
                          <Label className="text-xs capitalize">{colorKey}</Label>
                          <div className="grid grid-cols-5 gap-1">
                            {Array.from({ length: 5 }).map((_, i) => {
                              const opacity = 0.2 + (i * 0.2)
                              return (
                                <div 
                                  key={`${colorKey}-${i}`}
                                  className="h-8 rounded border"
                                  style={{ 
                                    backgroundColor: colors[colorKey as keyof typeof colors],
                                    opacity
                                  }}
                                />
                              )
                            })}
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle className="text-base">Usage Example</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div 
                      className="p-4 rounded-lg border"
                      style={{ backgroundColor: `${colors.primary}10` }}
                    >
                      <h4 
                        className="font-semibold mb-2" 
                        style={{ color: colors.primary }}
                      >
                        Brand Color Preview
                      </h4>
                      <p 
                        className="text-sm mb-3" 
                        style={{ color: colors.secondary }}
                      >
                        This shows how your colors work together in content and marketing materials.
                      </p>
                      <Button 
                        size="sm" 
                        style={{ 
                          backgroundColor: colors.accent, 
                          color: 'white', 
                          border: 'none' 
                        }}
                      >
                        Call to Action
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>
          </div>
        </TabsContent>

        {/* Logo Elements Tab */}
        <TabsContent value="logo" className="space-y-6">
          <div className="space-y-6">
            <div className="flex items-center gap-2">
              <h3 className="font-medium text-lg">Brand Elements</h3>
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger>
                    <HelpCircle className="h-4 w-4 text-blue-600" />
                  </TooltipTrigger>
                  <TooltipContent className="max-w-md">
                    <p>Your brand elements include logos, patterns, and other visual assets that create a cohesive brand identity.</p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[
                { type: 'horizontal', label: 'Horizontal Logo', bg: 'bg-white' },
                { type: 'vertical', label: 'Vertical Logo', bg: 'bg-white' },
                { type: 'symbol', label: 'Symbol/Icon', bg: 'bg-white' },
                { type: 'pattern', label: 'Brand Pattern', bg: 'bg-white' },
                { type: 'white-horizontal', label: 'White Horizontal', bg: 'bg-gray-800' },
                { type: 'white-vertical', label: 'White Vertical', bg: 'bg-gray-800' }
              ].map(({ type, label, bg }) => {
                const variant = logo.logoVariants.find(v => v.type === type)
                return (
                  <Card key={type}>
                    <CardHeader className="pb-3">
                      <CardTitle className="text-sm">{label}</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className={`border-2 border-dashed border-gray-300 rounded-lg p-4 h-32 flex items-center justify-center ${bg}`}>
                        {variant?.imageUrl ? (
                          <div className="relative w-full h-full flex items-center justify-center">
                            <img 
                              src={variant.imageUrl} 
                              alt={label} 
                              className="max-h-full max-w-full object-contain"
                            />
                            <button 
                              className="absolute top-1 right-1 bg-red-500 text-white p-1 rounded-full hover:bg-red-600 transition-colors"
                              onClick={() => {
                                const updatedVariants = logo.logoVariants.map(v => 
                                  v.type === type ? {...v, imageUrl: ''} : v
                                )
                                setLogo({...logo, logoVariants: updatedVariants})
                                setHasUnsavedChanges(true)
                              }}
                            >
                              <Trash2 className="h-3 w-3" />
                            </button>
                          </div>
                        ) : (
                          <div className={`flex flex-col items-center justify-center ${bg === 'bg-gray-800' ? 'text-gray-300' : 'text-gray-500'}`}>
                            <FileImage className="h-8 w-8 mb-2" />
                            <p className="text-xs text-center mb-2">{label}</p>
                            <Button 
                              variant="outline" 
                              onClick={() => handleLogoVariantUpload(type)}
                              className={`h-8 text-xs ${bg === 'bg-gray-800' ? 'bg-gray-700 text-white hover:bg-gray-600 border-gray-600' : ''}`}
                              size="sm"
                            >
                              <Upload className="h-3 w-3 mr-1" />
                              Upload
                            </Button>
                          </div>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                )
              })}
            </div>
            
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center justify-between text-base">
                  Logo Usage Guidelines
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={generateLogoGuidelines}
                    className="flex items-center"
                  >
                    <Sparkles className="h-4 w-4 mr-1" />
                    Generate
                  </Button>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <Textarea 
                  value={logo.usage}
                  onChange={(e) => setLogo({...logo, usage: e.target.value})}
                  placeholder="Describe how your logo should and should not be used..."
                  className="min-h-[120px] resize-none"
                />
                
                <div className="bg-blue-50 p-4 rounded-lg border border-blue-200 mt-4">
                  <h4 className="text-sm font-medium mb-2 text-blue-900">Logo Upload Best Practices</h4>
                  <div className="space-y-2 text-xs text-blue-800">
                    <div className="flex items-start gap-2">
                      <ImageIcon className="h-4 w-4 mt-0.5" />
                      <div>
                        <p className="font-medium">File Format:</p>
                        <p>Upload in PNG or SVG format with transparent background</p>
                      </div>
                    </div>
                    <div className="flex items-start gap-2">
                      <Maximize className="h-4 w-4 mt-0.5" />
                      <div>
                        <p className="font-medium">Dimensions:</p>
                        <p>Upload at least 1000px wide for high-resolution displays</p>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
        
        {/* Typography Tab */}
        <TabsContent value="typography" className="space-y-6">
          <div className="space-y-6">
            <div className="flex items-center gap-2">
              <h3 className="font-medium text-lg">Typography System</h3>
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger>
                    <HelpCircle className="h-4 w-4 text-blue-600" />
                  </TooltipTrigger>
                  <TooltipContent className="max-w-md">
                    <p>Consistent typography creates a professional appearance across all materials. Choose fonts that reflect your brand personality and ensure readability.</p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            </div>
            
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div className="space-y-6">
                <Card>
                  <CardHeader>
                    <CardTitle className="text-base">Font Selection</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="space-y-2">
                      <Label>Primary Font</Label>
                      <Select 
                        value={typography.primaryFont} 
                        onValueChange={(value) => handleFontChange(value, 'primaryFont')}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select primary font" />
                        </SelectTrigger>
                        <SelectContent>
                          {fontOptions.map((font) => (
                            <SelectItem key={font.value} value={font.value}>
                              {font.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <p className="text-xs text-gray-500">Used for headings and important text</p>
                    </div>
                    
                    <div className="space-y-2">
                      <Label>Secondary Font</Label>
                      <Select 
                        value={typography.secondaryFont} 
                        onValueChange={(value) => handleFontChange(value, 'secondaryFont')}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select secondary font" />
                        </SelectTrigger>
                        <SelectContent>
                          {fontOptions.map((font) => (
                            <SelectItem key={font.value} value={font.value}>
                              {font.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <p className="text-xs text-gray-500">Used for subheadings and accents</p>
                    </div>
                    
                    <div className="space-y-2">
                      <Label>Body Font</Label>
                      <Select 
                        value={typography.bodyFont} 
                        onValueChange={(value) => handleFontChange(value, 'bodyFont')}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select body font" />
                        </SelectTrigger>
                        <SelectContent>
                          {fontOptions.map((font) => (
                            <SelectItem key={font.value} value={font.value}>
                              {font.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <p className="text-xs text-gray-500">Used for paragraph text and content</p>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle className="text-base">Type Scale</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label>Base Size</Label>
                        <Input
                          value={typography.baseSize}
                          onChange={(e) => setTypography({...typography, baseSize: e.target.value})}
                          placeholder="16px"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label>Scale Ratio</Label>
                        <Input
                          value={typography.scaleRatio}
                          onChange={(e) => setTypography({...typography, scaleRatio: e.target.value})}
                          placeholder="1.250"
                        />
                      </div>
                    </div>
                    
                    <div className="space-y-3 pt-2">
                      <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-1">
                          <Label className="text-xs">H1 Size</Label>
                          <Input
                            value={typography.h1.size}
                            onChange={(e) => setTypography({
                              ...typography,
                              h1: {...typography.h1, size: e.target.value}
                            })}
                            className="text-sm"
                          />
                        </div>
                        <div className="space-y-1">
                          <Label className="text-xs">H1 Weight</Label>
                          <Select 
                            value={typography.h1.weight} 
                            onValueChange={(value) => setTypography({
                              ...typography,
                              h1: {...typography.h1, weight: value}
                            })}
                          >
                            <SelectTrigger className="text-sm">
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="300">300 (Light)</SelectItem>
                              <SelectItem value="400">400 (Regular)</SelectItem>
                              <SelectItem value="500">500 (Medium)</SelectItem>
                              <SelectItem value="600">600 (Semibold)</SelectItem>
                              <SelectItem value="700">700 (Bold)</SelectItem>
                              <SelectItem value="800">800 (Black)</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
              
              <div className="space-y-6">
                <Card>
                  <CardHeader>
                    <CardTitle className="text-base">Font Preview</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <div>
                        <Label className="text-xs text-gray-500">Primary Font</Label>
                        <FontPreview 
                          fontFamily={typography.primaryFont}
                          text="Primary Heading Example" 
                        />
                      </div>
                      
                      <div>
                        <Label className="text-xs text-gray-500">Secondary Font</Label>
                        <FontPreview 
                          fontFamily={typography.secondaryFont}
                          text="Secondary Heading Style" 
                        />
                      </div>
                      
                      <div>
                        <Label className="text-xs text-gray-500">Body Font</Label>
                        <FontPreview 
                          fontFamily={typography.bodyFont}
                          text="This is body text that shows how readable the font is for longer content and paragraphs." 
                        />
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>
          </div>
        </TabsContent>
        
        {/* Style Training Tab */}
        <TabsContent value="style-training" className="space-y-6">
          <div className="space-y-6">
            <div className="flex items-center gap-2">
              <h3 className="font-medium text-lg">AI Style Training</h3>
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger>
                    <HelpCircle className="h-4 w-4 text-blue-600" />
                  </TooltipTrigger>
                  <TooltipContent className="max-w-md">
                    <p>Train your AI to understand and reproduce your brand's unique style across all content generation.</p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            </div>
            
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Training Guide</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {[
                    {
                      step: 1,
                      title: "Gather Style Examples",
                      description: "Collect 5-10 examples of content that perfectly represents your brand voice and visual style.",
                      icon: <FileImage className="h-5 w-5" />
                    },
                    {
                      step: 2,
                      title: "Annotate Your Examples", 
                      description: "Add notes highlighting specific elements that reflect your brand's tone and style.",
                      icon: <FileText className="h-5 w-5" />
                    },
                    {
                      step: 3,
                      title: "Provide Counter-Examples",
                      description: "Include examples of content that does NOT match your brand style.",
                      icon: <X className="h-5 w-5" />
                    }
                  ].map(({ step, title, description, icon }) => (
                    <div key={step} className="flex items-start gap-3">
                      <div className="bg-blue-100 text-blue-700 rounded-full w-8 h-8 flex items-center justify-center shrink-0">
                        {step}
                      </div>
                      <div className="flex-1">
                        <h4 className="font-medium mb-1">{title}</h4>
                        <p className="text-sm text-gray-600">{description}</p>
                      </div>
                      <div className="text-blue-600">{icon}</div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Test Your AI Training</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label>Test Prompt</Label>
                  <Textarea 
                    value={testPrompt}
                    onChange={(e) => setTestPrompt(e.target.value)}
                    placeholder="Enter a prompt to test if the AI generates content in your style..."
                    className="min-h-[80px] resize-none"
                  />
                </div>
                
                <div className="flex justify-center">
                  <Button 
                    onClick={generateTestContent}
                    disabled={isGenerating || !testPrompt.trim()}
                    variant="outline"
                    className="flex items-center"
                  >
                    {isGenerating ? (
                      <>
                        <Wand2 className="h-4 w-4 mr-2 animate-spin" />
                        Generating...
                      </>
                    ) : (
                      <>
                        <Sparkles className="h-4 w-4 mr-2" />
                        Generate Test Content
                      </>
                    )}
                  </Button>
                </div>
                
                {generatedContent && (
                  <div className="border border-gray-200 rounded-md p-4 bg-gray-50">
                    <Label className="text-xs text-gray-500 mb-2 block">Generated Content</Label>
                    <p className="text-sm">{generatedContent}</p>
                    
                    <div className="flex items-center gap-3 mt-4 pt-3 border-t">
                      <Button variant="outline" size="sm" className="flex items-center">
                        <Check className="h-4 w-4 text-green-500 mr-1" />
                        Looks Good
                      </Button>
                      <Button variant="outline" size="sm" className="flex items-center">
                        <X className="h-4 w-4 text-red-500 mr-1" />
                        Needs Improvement
                      </Button>
                    </div>
                  </div>
                )}
                
                <div className="bg-yellow-50 border border-yellow-200 rounded-md p-4">
                  <div className="flex items-start gap-2">
                    <AlertCircle className="h-5 w-5 text-yellow-500 shrink-0 mt-0.5" />
                    <div>
                      <h5 className="text-sm font-medium text-yellow-800 mb-1">Important Note</h5>
                      <p className="text-sm text-yellow-700">
                        The more quality examples you provide, the better the AI will understand and reproduce your style. 
                        Update your training materials regularly as your brand evolves.
                      </p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>

      {/* Navigation */}
      <div className="flex justify-between pt-6 border-t">
        <Button onClick={onBack} variant="outline" className="flex items-center">
          <ChevronLeft className="mr-2 h-4 w-4" />
          Back
        </Button>
        <Button 
          onClick={onNext}
          className="flex items-center bg-blue-600 hover:bg-blue-700"
        >
          Continue
          <ChevronRight className="ml-2 h-4 w-4" />
        </Button>
      </div>
    </div>
  )
}