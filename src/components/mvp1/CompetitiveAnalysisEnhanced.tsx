import React, { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card'
import { Button } from '../ui/button'
import { Input } from '../ui/input'
import { 
  Search, 
  TrendingUp, 
  TrendingDown, 
  Target, 
  AlertTriangle,
  CheckCircle2,
  ExternalLink,
  Loader2,
  Plus,
  X
} from 'lucide-react'
import { useSlottedContext } from '../../contexts/SlottedContext'
import { modernAIOrchestrator } from '../../services/ai/modern-ai-orchestrator'
import { enhancedWebsiteAnalyzer } from '../../services/web-automation/enhanced-website-analyzer'

interface Competitor {
  name: string
  website: string
  strengths: string[]
  weaknesses: string[]
  marketPosition: string
  analysisStatus: 'pending' | 'analyzing' | 'complete' | 'error'
}

export function CompetitiveAnalysisEnhanced() {
  const { context, updateContext } = useSlottedContext()
  const [competitors, setCompetitors] = useState<Competitor[]>(
    context.competitiveAnalysis?.competitors.map(c => ({ ...c, analysisStatus: 'complete' as const })) || []
  )
  const [newCompetitorUrl, setNewCompetitorUrl] = useState('')
  const [isAnalyzing, setIsAnalyzing] = useState(false)
  const [swotAnalysis, setSWOTAnalysis] = useState(context.competitiveAnalysis?.swotAnalysis || {
    strengths: [],
    weaknesses: [],
    opportunities: [],
    threats: []
  })

  const analyzeCompetitorWebsite = async (url: string) => {
    try {
      const analysis = await enhancedWebsiteAnalyzer.analyzeWebsite({
        url,
        extractBrandDNA: true,
        extractCompanyInfo: true,
        extractContentStructure: true,
        extractVisualElements: true
      })

      // Use AI to convert website analysis into competitor insights
      const competitorInsights = await modernAIOrchestrator.generateContent({
        prompt: `Based on this website analysis, create a competitive analysis summary:
        
        ${JSON.stringify(analysis, null, 2)}
        
        Return a JSON object with:
        - name: Company name
        - strengths: Array of 3-5 key strengths
        - weaknesses: Array of 3-5 potential weaknesses
        - marketPosition: Brief description of their market position
        
        Focus on marketing, positioning, user experience, and competitive advantages.`,
        context: 'competitive-analysis',
        temperature: 0.3
      })

      return JSON.parse(competitorInsights.content)
    } catch (error) {
      console.error('Competitor analysis failed:', error)
      throw new Error('Failed to analyze competitor website')
    }
  }

  const addCompetitor = async () => {
    if (!newCompetitorUrl.trim()) return

    const url = newCompetitorUrl.startsWith('http') 
      ? newCompetitorUrl 
      : `https://${newCompetitorUrl}`

    // Add competitor with pending status
    const newCompetitor: Competitor = {
      name: 'Analyzing...',
      website: url,
      strengths: [],
      weaknesses: [],
      marketPosition: '',
      analysisStatus: 'analyzing'
    }

    setCompetitors(prev => [...prev, newCompetitor])
    setNewCompetitorUrl('')

    try {
      const analysis = await analyzeCompetitorWebsite(url)
      
      // Update competitor with analysis results
      setCompetitors(prev => 
        prev.map((comp, index) => 
          index === prev.length - 1 
            ? { ...analysis, website: url, analysisStatus: 'complete' as const }
            : comp
        )
      )
    } catch (error) {
      // Mark as error
      setCompetitors(prev => 
        prev.map((comp, index) => 
          index === prev.length - 1 
            ? { ...comp, name: 'Analysis Failed', analysisStatus: 'error' as const }
            : comp
        )
      )
    }
  }

  const removeCompetitor = (index: number) => {
    setCompetitors(prev => prev.filter((_, i) => i !== index))
  }

  const generateSWOTAnalysis = async () => {
    setIsAnalyzing(true)
    
    try {
      const swotPrompt = `Based on our company context and competitor analysis, generate a comprehensive SWOT analysis:
      
      Company Context:
      ${JSON.stringify(context.company, null, 2)}
      ${JSON.stringify(context.brandDNA, null, 2)}
      
      Competitor Analysis:
      ${JSON.stringify(competitors.filter(c => c.analysisStatus === 'complete'), null, 2)}
      
      Return a JSON object with:
      {
        "strengths": ["5-7 internal strengths"],
        "weaknesses": ["5-7 internal weaknesses"],
        "opportunities": ["5-7 external opportunities"], 
        "threats": ["5-7 external threats"]
      }
      
      Make it specific to our industry and competitive landscape.`

      const swotResult = await modernAIOrchestrator.generateContent({
        prompt: swotPrompt,
        context: 'competitive-analysis',
        temperature: 0.4
      })

      const newSWOT = JSON.parse(swotResult.content)
      setSWOTAnalysis(newSWOT)

      // Update context
      await updateContext({
        competitiveAnalysis: {
          competitors: competitors.filter(c => c.analysisStatus === 'complete').map(({ analysisStatus, ...c }) => c),
          swotAnalysis: newSWOT,
          marketGaps: [] // Will be enhanced later
        }
      })

    } catch (error) {
      console.error('SWOT analysis failed:', error)
    } finally {
      setIsAnalyzing(false)
    }
  }

  const SWOTSection = ({ title, items, icon, color }: { 
    title: string
    items: string[]
    icon: React.ReactNode
    color: string 
  }) => (
    <div className={`p-6 rounded-xl border-2 ${color}`}>
      <div className="flex items-center space-x-2 mb-4">
        {icon}
        <h3 className="font-semibold text-lg">{title}</h3>
      </div>
      <ul className="space-y-2">
        {items.map((item, index) => (
          <motion.li
            key={index}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: index * 0.1 }}
            className="text-sm flex items-start space-x-2"
          >
            <span className="text-gray-400 mt-1">•</span>
            <span>{item}</span>
          </motion.li>
        ))}
      </ul>
    </div>
  )

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="text-center">
        <h2 className="text-3xl font-bold text-gray-900 mb-2">Competitive Analysis</h2>
        <p className="text-gray-600">
          Understand your competitive landscape with AI-powered insights
        </p>
      </div>

      {/* Add Competitor Section */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Search className="w-5 h-5" />
            <span>Analyze Competitors</span>
          </CardTitle>
          <CardDescription>
            Add competitor websites for automated analysis
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex space-x-4">
            <Input
              placeholder="Enter competitor website URL"
              value={newCompetitorUrl}
              onChange={(e) => setNewCompetitorUrl(e.target.value)}
              className="flex-1"
              onKeyDown={(e) => e.key === 'Enter' && addCompetitor()}
            />
            <Button 
              onClick={addCompetitor}
              disabled={!newCompetitorUrl.trim()}
            >
              <Plus className="w-4 h-4 mr-2" />
              Analyze
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Competitors List */}
      <div className="grid gap-6">
        <AnimatePresence>
          {competitors.map((competitor, index) => (
            <motion.div
              key={`${competitor.website}-${index}`}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.3 }}
            >
              <Card>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <CardTitle className="text-lg">{competitor.name}</CardTitle>
                      {competitor.analysisStatus === 'analyzing' && (
                        <Loader2 className="w-4 h-4 animate-spin text-blue-600" />
                      )}
                      {competitor.analysisStatus === 'complete' && (
                        <CheckCircle2 className="w-4 h-4 text-green-600" />
                      )}
                      {competitor.analysisStatus === 'error' && (
                        <AlertTriangle className="w-4 h-4 text-red-600" />
                      )}
                    </div>
                    <div className="flex items-center space-x-2">
                      <a 
                        href={competitor.website}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-blue-600 hover:text-blue-800"
                      >
                        <ExternalLink className="w-4 h-4" />
                      </a>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => removeCompetitor(index)}
                      >
                        <X className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                  {competitor.marketPosition && (
                    <CardDescription>{competitor.marketPosition}</CardDescription>
                  )}
                </CardHeader>
                {competitor.analysisStatus === 'complete' && (
                  <CardContent>
                    <div className="grid md:grid-cols-2 gap-6">
                      <div>
                        <h4 className="font-medium text-green-700 mb-3 flex items-center">
                          <TrendingUp className="w-4 h-4 mr-2" />
                          Strengths
                        </h4>
                        <ul className="space-y-2">
                          {competitor.strengths.map((strength, i) => (
                            <li key={i} className="text-sm text-gray-600 flex items-start">
                              <span className="text-green-500 mr-2 mt-1">+</span>
                              {strength}
                            </li>
                          ))}
                        </ul>
                      </div>
                      <div>
                        <h4 className="font-medium text-red-700 mb-3 flex items-center">
                          <TrendingDown className="w-4 h-4 mr-2" />
                          Weaknesses
                        </h4>
                        <ul className="space-y-2">
                          {competitor.weaknesses.map((weakness, i) => (
                            <li key={i} className="text-sm text-gray-600 flex items-start">
                              <span className="text-red-500 mr-2 mt-1">-</span>
                              {weakness}
                            </li>
                          ))}
                        </ul>
                      </div>
                    </div>
                  </CardContent>
                )}
              </Card>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>

      {/* SWOT Analysis */}
      {competitors.some(c => c.analysisStatus === 'complete') && (
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle>SWOT Analysis</CardTitle>
                <CardDescription>
                  Strategic analysis of your competitive position
                </CardDescription>
              </div>
              <Button 
                onClick={generateSWOTAnalysis}
                disabled={isAnalyzing}
              >
                {isAnalyzing ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Analyzing...
                  </>
                ) : (
                  <>
                    <Target className="w-4 h-4 mr-2" />
                    Generate SWOT
                  </>
                )}
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <div className="grid md:grid-cols-2 gap-6">
              <SWOTSection
                title="Strengths"
                items={swotAnalysis.strengths}
                icon={<TrendingUp className="w-5 h-5 text-green-600" />}
                color="border-green-200 bg-green-50"
              />
              <SWOTSection
                title="Weaknesses" 
                items={swotAnalysis.weaknesses}
                icon={<TrendingDown className="w-5 h-5 text-red-600" />}
                color="border-red-200 bg-red-50"
              />
              <SWOTSection
                title="Opportunities"
                items={swotAnalysis.opportunities}
                icon={<Target className="w-5 h-5 text-blue-600" />}
                color="border-blue-200 bg-blue-50"
              />
              <SWOTSection
                title="Threats"
                items={swotAnalysis.threats}
                icon={<AlertTriangle className="w-5 h-5 text-yellow-600" />}
                color="border-yellow-200 bg-yellow-50"
              />
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}