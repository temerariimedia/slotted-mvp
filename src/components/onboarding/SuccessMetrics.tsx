import React, { useState, useEffect } from 'react'
import { Button } from '../ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card'
import { Badge } from '../ui/badge'
import { Label } from '../ui/label'
import { Input } from '../ui/input'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../ui/tabs'
import { Checkbox } from '../ui/checkbox'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select'
import { 
  TooltipProvider, 
  Tooltip, 
  TooltipTrigger, 
  TooltipContent 
} from '../ui/tooltip'
import { Plus, Target, TrendingUp, Users, CreditCard, Star, Settings, HelpCircle, Sparkles, Loader2 } from 'lucide-react'
import { useSlottedContext } from '../../contexts/SlottedContext'
import { modernAIOrchestrator } from '../../services/ai/modern-ai-orchestrator'

// Journey stage configuration with colors
const JOURNEY_STAGES = {
  awareness: {
    name: 'Awareness',
    color: 'blue',
    description: 'Metrics for brand visibility and reach'
  },
  consideration: {
    name: 'Consideration',
    color: 'purple',
    description: 'Metrics for engagement and interest'
  },
  decision: {
    name: 'Decision',
    color: 'green',
    description: 'Metrics for conversions and sales'
  },
  retention: {
    name: 'Retention',
    color: 'orange',
    description: 'Metrics for customer satisfaction and loyalty'
  }
}

// Predefined metrics organized by category and journey stage
const PREDEFINED_METRICS = {
  acquisition: {
    name: 'Customer Acquisition',
    icon: Users,
    metrics: [
      { id: 'website_traffic', name: 'Website Traffic', unit: 'visits/month', stages: ['awareness'] },
      { id: 'qualified_leads', name: 'Qualified Leads', unit: 'leads/month', stages: ['consideration'] },
      { id: 'conversion_rate', name: 'Conversion Rate', unit: '%', stages: ['decision'] },
      { id: 'customer_acquisition_cost', name: 'Customer Acquisition Cost', unit: '$', stages: ['decision'] },
      { id: 'lead_to_customer_rate', name: 'Lead-to-Customer Rate', unit: '%', stages: ['decision'] }
    ]
  },
  revenue: {
    name: 'Revenue & Growth',
    icon: CreditCard,
    metrics: [
      { id: 'monthly_revenue', name: 'Monthly Recurring Revenue', unit: '$', stages: ['decision', 'retention'] },
      { id: 'average_order_value', name: 'Average Order Value', unit: '$', stages: ['decision'] },
      { id: 'customer_lifetime_value', name: 'Customer Lifetime Value', unit: '$', stages: ['retention'] },
      { id: 'revenue_growth_rate', name: 'Revenue Growth Rate', unit: '%/month', stages: ['retention'] },
      { id: 'upsell_rate', name: 'Upsell/Cross-sell Rate', unit: '%', stages: ['retention'] }
    ]
  },
  satisfaction: {
    name: 'Customer Satisfaction',
    icon: Star,
    metrics: [
      { id: 'customer_satisfaction', name: 'Customer Satisfaction Score', unit: '/10', stages: ['retention'] },
      { id: 'net_promoter_score', name: 'Net Promoter Score', unit: 'NPS', stages: ['retention'] },
      { id: 'churn_rate', name: 'Customer Churn Rate', unit: '%/month', stages: ['retention'] },
      { id: 'support_ticket_resolution', name: 'Support Ticket Resolution Time', unit: 'hours', stages: ['retention'] },
      { id: 'customer_effort_score', name: 'Customer Effort Score', unit: '/5', stages: ['retention'] }
    ]
  },
  product: {
    name: 'Product Performance',
    icon: Target,
    metrics: [
      { id: 'feature_adoption_rate', name: 'Feature Adoption Rate', unit: '%', stages: ['consideration', 'retention'] },
      { id: 'user_engagement', name: 'User Engagement Score', unit: '/100', stages: ['consideration', 'retention'] },
      { id: 'product_usage_frequency', name: 'Product Usage Frequency', unit: 'uses/week', stages: ['retention'] },
      { id: 'onboarding_completion', name: 'Onboarding Completion Rate', unit: '%', stages: ['consideration'] },
      { id: 'time_to_value', name: 'Time to First Value', unit: 'days', stages: ['consideration'] }
    ]
  },
  operations: {
    name: 'Operational Efficiency',
    icon: Settings,
    metrics: [
      { id: 'marketing_roi', name: 'Marketing ROI', unit: 'x', stages: ['awareness', 'consideration', 'decision'] },
      { id: 'sales_cycle_length', name: 'Sales Cycle Length', unit: 'days', stages: ['consideration', 'decision'] },
      { id: 'team_productivity', name: 'Team Productivity Score', unit: '/100', stages: ['awareness', 'consideration', 'decision', 'retention'] },
      { id: 'campaign_performance', name: 'Campaign Performance Score', unit: '/100', stages: ['awareness', 'consideration'] },
      { id: 'cost_per_acquisition', name: 'Cost Per Acquisition', unit: '$', stages: ['decision'] }
    ]
  }
}

export interface SuccessMetric {
  id: string
  name: string
  category: string
  unit: string
  currentValue?: string
  targetValue?: string
  frequency: 'daily' | 'weekly' | 'monthly' | 'quarterly'
  stages: string[]
  isCustom?: boolean
}

interface SuccessMetricsProps {
  onNext: () => void
  onBack: () => void
}

export function SuccessMetrics({ onNext, onBack }: SuccessMetricsProps) {
  const { context, updateContext } = useSlottedContext()
  const [selectedMetrics, setSelectedMetrics] = useState<SuccessMetric[]>(context.successMetrics?.metrics || [])
  const [activeTab, setActiveTab] = useState('select-metrics')
  const [activeStage, setActiveStage] = useState<string>('awareness')
  const [customMetric, setCustomMetric] = useState({
    name: '',
    unit: '',
    category: 'custom',
    frequency: 'monthly' as const,
    stages: [] as string[]
  })
  const [generatingTargets, setGeneratingTargets] = useState(false)

  // Update context when metrics change
  useEffect(() => {
    updateContext({
      successMetrics: {
        metrics: selectedMetrics,
        framework: context.successMetrics?.framework || 'balanced-scorecard',
        reviewFrequency: context.successMetrics?.reviewFrequency || 'monthly'
      }
    })
  }, [selectedMetrics])

  // Toggle metric selection
  const toggleMetric = (metricData: any, category: string) => {
    const metricId = metricData.id
    const existingIndex = selectedMetrics.findIndex(m => m.id === metricId)
    
    if (existingIndex >= 0) {
      setSelectedMetrics(prev => prev.filter(m => m.id !== metricId))
    } else {
      const newMetric: SuccessMetric = {
        id: metricId,
        name: metricData.name,
        category,
        unit: metricData.unit,
        frequency: 'monthly',
        stages: metricData.stages || ['awareness'],
        currentValue: '',
        targetValue: ''
      }
      setSelectedMetrics(prev => [...prev, newMetric])
    }
  }

  // Add custom metric
  const addCustomMetric = () => {
    if (!customMetric.name || !customMetric.unit || customMetric.stages.length === 0) {
      return
    }

    const newMetric: SuccessMetric = {
      id: `custom_${Date.now()}`,
      name: customMetric.name,
      category: 'custom',
      unit: customMetric.unit,
      frequency: customMetric.frequency,
      stages: customMetric.stages,
      isCustom: true,
      currentValue: '',
      targetValue: ''
    }

    setSelectedMetrics(prev => [...prev, newMetric])
    setCustomMetric({
      name: '',
      unit: '',
      category: 'custom',
      frequency: 'monthly',
      stages: []
    })
  }

  // Update metric configuration
  const updateMetricConfig = (metricId: string, field: keyof SuccessMetric, value: any) => {
    setSelectedMetrics(prev => 
      prev.map(metric => 
        metric.id === metricId 
          ? { ...metric, [field]: value }
          : metric
      )
    )
  }

  // Generate AI-powered targets
  const generateAITargets = async () => {
    if (selectedMetrics.length === 0) return

    setGeneratingTargets(true)
    try {
      const metricDescriptions = selectedMetrics.map(metric => 
        `${metric.name} (${metric.unit}) - Category: ${metric.category}`
      ).join('\n')

      const companyContext = `
        Company: ${context.companyInfo?.companyName || 'Unknown'}
        Industry: ${context.companyInfo?.industry || 'Unknown'}
        Target Market: ${context.targetSegments?.primarySegment?.name || 'Unknown'}
        Current Revenue Stage: ${context.pricingStrategy?.model || 'Unknown'}
        Selected Channels: ${context.channelConfiguration?.primary?.map(c => c.name).join(', ') || 'Unknown'}
      `

      const prompt = `Based on this company context and selected metrics, generate realistic target values:

${companyContext}

Selected Metrics:
${metricDescriptions}

For each metric, provide a realistic target value based on:
1. Industry benchmarks
2. Company stage and size
3. Market conditions
4. Best practices

Return a JSON object with metric IDs as keys and target values as strings (include units where appropriate).
Example: { "website_traffic": "10000", "conversion_rate": "2.5" }`

      const response = await modernAIOrchestrator.generateContent({
        prompt,
        context: 'success-metrics-targets',
        temperature: 0.3
      })

      const targets = JSON.parse(response.content)
      
      // Update metrics with generated targets
      setSelectedMetrics(prev => 
        prev.map(metric => ({
          ...metric,
          targetValue: targets[metric.id] || metric.targetValue || ''
        }))
      )

    } catch (error) {
      console.error('Error generating AI targets:', error)
    } finally {
      setGeneratingTargets(false)
    }
  }

  // Get metrics for current stage
  const getMetricsForStage = (stage: string) => {
    return selectedMetrics.filter(metric => 
      metric.stages.includes(stage)
    )
  }

  // Get stage color classes
  const getStageColorClasses = (stage: string) => {
    const stageInfo = JOURNEY_STAGES[stage as keyof typeof JOURNEY_STAGES]
    const colorMap = {
      blue: 'bg-blue-50 border-blue-200 text-blue-700',
      purple: 'bg-purple-50 border-purple-200 text-purple-700',
      green: 'bg-green-50 border-green-200 text-green-700',
      orange: 'bg-orange-50 border-orange-200 text-orange-700'
    }
    return colorMap[stageInfo?.color as keyof typeof colorMap] || colorMap.blue
  }

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      <div className="text-center">
        <h2 className="text-2xl font-bold text-gray-900 mb-2">Success Metrics & KPIs</h2>
        <p className="text-gray-600">
          Define the key performance indicators that will measure your marketing success across the customer journey
        </p>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="select-metrics">Select Metrics</TabsTrigger>
          <TabsTrigger value="configure-metrics">Configure</TabsTrigger>
          <TabsTrigger value="journey-view">Journey View</TabsTrigger>
        </TabsList>

        {/* Metric Selection Tab */}
        <TabsContent value="select-metrics" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Categories */}
            <div className="lg:col-span-2 space-y-6">
              {Object.entries(PREDEFINED_METRICS).map(([categoryKey, category]) => {
                const Icon = category.icon
                return (
                  <Card key={categoryKey}>
                    <CardHeader className="pb-3">
                      <CardTitle className="flex items-center gap-3 text-lg">
                        <div className="p-2 bg-blue-100 rounded-lg">
                          <Icon className="h-5 w-5 text-blue-600" />
                        </div>
                        {category.name}
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                        {category.metrics.map(metric => {
                          const isSelected = selectedMetrics.some(m => m.id === metric.id)
                          return (
                            <div
                              key={metric.id}
                              className={`p-3 rounded-lg border-2 cursor-pointer transition-all ${
                                isSelected 
                                  ? 'bg-blue-50 border-blue-300 shadow-sm' 
                                  : 'bg-white border-gray-200 hover:bg-gray-50 hover:border-gray-300'
                              }`}
                              onClick={() => toggleMetric(metric, categoryKey)}
                            >
                              <div className="flex justify-between items-start">
                                <div className="flex-1">
                                  <h4 className="font-medium text-sm">{metric.name}</h4>
                                  <p className="text-xs text-gray-500 mt-1">
                                    Unit: {metric.unit}
                                  </p>
                                  <div className="flex flex-wrap gap-1 mt-2">
                                    {metric.stages.map(stage => (
                                      <Badge 
                                        key={stage}
                                        variant="outline" 
                                        className={`text-xs ${getStageColorClasses(stage)}`}
                                      >
                                        {JOURNEY_STAGES[stage as keyof typeof JOURNEY_STAGES]?.name}
                                      </Badge>
                                    ))}
                                  </div>
                                </div>
                                <Checkbox 
                                  checked={isSelected}
                                  onChange={() => toggleMetric(metric, categoryKey)}
                                />
                              </div>
                            </div>
                          )
                        })}
                      </div>
                    </CardContent>
                  </Card>
                )
              })}
            </div>

            {/* Custom Metrics & Summary */}
            <div className="space-y-6">
              {/* Custom Metric Creator */}
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="flex items-center gap-2 text-lg">
                    <Plus className="h-5 w-5" />
                    Custom Metric
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <Label className="text-sm">Metric Name</Label>
                    <Input
                      value={customMetric.name}
                      onChange={(e) => setCustomMetric(prev => ({...prev, name: e.target.value}))}
                      placeholder="e.g., Brand Awareness Score"
                      className="mt-1"
                    />
                  </div>
                  
                  <div>
                    <Label className="text-sm">Unit</Label>
                    <Input
                      value={customMetric.unit}
                      onChange={(e) => setCustomMetric(prev => ({...prev, unit: e.target.value}))}
                      placeholder="e.g., %, $, points"
                      className="mt-1"
                    />
                  </div>

                  <div>
                    <Label className="text-sm">Tracking Frequency</Label>
                    <Select 
                      value={customMetric.frequency} 
                      onValueChange={(value: any) => setCustomMetric(prev => ({...prev, frequency: value}))}
                    >
                      <SelectTrigger className="mt-1">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="daily">Daily</SelectItem>
                        <SelectItem value="weekly">Weekly</SelectItem>
                        <SelectItem value="monthly">Monthly</SelectItem>
                        <SelectItem value="quarterly">Quarterly</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <Label className="text-sm">Journey Stages</Label>
                    <div className="grid grid-cols-2 gap-2 mt-2">
                      {Object.entries(JOURNEY_STAGES).map(([stageKey, stage]) => (
                        <div key={stageKey} className="flex items-center space-x-2">
                          <Checkbox 
                            id={`custom-stage-${stageKey}`}
                            checked={customMetric.stages.includes(stageKey)}
                            onCheckedChange={(checked) => {
                              if (checked) {
                                setCustomMetric(prev => ({
                                  ...prev, 
                                  stages: [...prev.stages, stageKey]
                                }))
                              } else {
                                setCustomMetric(prev => ({
                                  ...prev, 
                                  stages: prev.stages.filter(s => s !== stageKey)
                                }))
                              }
                            }}
                          />
                          <Label htmlFor={`custom-stage-${stageKey}`} className="text-xs">
                            {stage.name}
                          </Label>
                        </div>
                      ))}
                    </div>
                  </div>

                  <Button 
                    onClick={addCustomMetric}
                    disabled={!customMetric.name || !customMetric.unit || customMetric.stages.length === 0}
                    className="w-full"
                    size="sm"
                  >
                    <Plus className="h-4 w-4 mr-1" />
                    Add Custom Metric
                  </Button>
                </CardContent>
              </Card>

              {/* Selected Metrics Summary */}
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="flex items-center justify-between text-lg">
                    <span>Selected Metrics</span>
                    <Badge variant="outline">{selectedMetrics.length}</Badge>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {selectedMetrics.length === 0 ? (
                    <p className="text-sm text-gray-500 text-center py-4">
                      Select metrics to build your measurement framework
                    </p>
                  ) : (
                    <div className="space-y-2">
                      {selectedMetrics.map(metric => (
                        <div key={metric.id} className="flex justify-between items-center py-2 border-b border-gray-100 last:border-b-0">
                          <div>
                            <span className="text-sm font-medium">{metric.name}</span>
                            <p className="text-xs text-gray-500">{metric.unit}</p>
                          </div>
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => setSelectedMetrics(prev => prev.filter(m => m.id !== metric.id))}
                            className="text-red-500 hover:text-red-700 hover:bg-red-50"
                          >
                            ×
                          </Button>
                        </div>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          </div>
        </TabsContent>

        {/* Configuration Tab */}
        <TabsContent value="configure-metrics" className="space-y-6">
          <div className="flex justify-between items-center">
            <h3 className="text-lg font-semibold">Configure Your Metrics</h3>
            <div className="flex gap-2">
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button
                      onClick={generateAITargets}
                      disabled={generatingTargets || selectedMetrics.length === 0}
                      variant="outline"
                      size="sm"
                    >
                      {generatingTargets ? (
                        <Loader2 className="h-4 w-4 animate-spin mr-1" />
                      ) : (
                        <Sparkles className="h-4 w-4 mr-1" />
                      )}
                      Generate AI Targets
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p className="text-xs">Auto-generate realistic target values based on industry benchmarks</p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            </div>
          </div>

          {selectedMetrics.length === 0 ? (
            <Card>
              <CardContent className="p-8 text-center">
                <Target className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <h3 className="font-medium text-gray-900 mb-2">No Metrics Selected</h3>
                <p className="text-gray-500 mb-4">
                  Go back to the "Select Metrics" tab to choose your key performance indicators
                </p>
                <Button onClick={() => setActiveTab('select-metrics')} variant="outline">
                  Select Metrics
                </Button>
              </CardContent>
            </Card>
          ) : (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {selectedMetrics.map(metric => (
                <Card key={metric.id}>
                  <CardHeader className="pb-3">
                    <CardTitle className="flex items-center justify-between text-base">
                      <span>{metric.name}</span>
                      {metric.isCustom && (
                        <Badge variant="outline" className="text-xs">Custom</Badge>
                      )}
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <Label className="text-sm">Current Value</Label>
                        <Input
                          value={metric.currentValue || ''}
                          onChange={(e) => updateMetricConfig(metric.id, 'currentValue', e.target.value)}
                          placeholder={`Enter current ${metric.unit}`}
                          className="mt-1"
                        />
                      </div>
                      <div>
                        <Label className="text-sm">Target Value</Label>
                        <Input
                          value={metric.targetValue || ''}
                          onChange={(e) => updateMetricConfig(metric.id, 'targetValue', e.target.value)}
                          placeholder={`Enter target ${metric.unit}`}
                          className="mt-1"
                        />
                      </div>
                    </div>

                    <div>
                      <Label className="text-sm">Tracking Frequency</Label>
                      <Select 
                        value={metric.frequency} 
                        onValueChange={(value: any) => updateMetricConfig(metric.id, 'frequency', value)}
                      >
                        <SelectTrigger className="mt-1">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="daily">Daily</SelectItem>
                          <SelectItem value="weekly">Weekly</SelectItem>
                          <SelectItem value="monthly">Monthly</SelectItem>
                          <SelectItem value="quarterly">Quarterly</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div>
                      <Label className="text-sm">Journey Stages</Label>
                      <div className="flex flex-wrap gap-1 mt-1">
                        {metric.stages.map(stage => (
                          <Badge 
                            key={stage}
                            className={`text-xs ${getStageColorClasses(stage)}`}
                          >
                            {JOURNEY_STAGES[stage as keyof typeof JOURNEY_STAGES]?.name}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>

        {/* Journey View Tab */}
        <TabsContent value="journey-view" className="space-y-6">
          <div className="flex justify-between items-center">
            <h3 className="text-lg font-semibold">Customer Journey Metrics</h3>
            <div className="flex gap-2">
              {Object.entries(JOURNEY_STAGES).map(([stageKey, stage]) => (
                <Button
                  key={stageKey}
                  size="sm"
                  variant={activeStage === stageKey ? "default" : "outline"}
                  onClick={() => setActiveStage(stageKey)}
                  className={activeStage === stageKey ? getStageColorClasses(stageKey) : ''}
                >
                  {stage.name}
                  <Badge variant="outline" className="ml-1">
                    {getMetricsForStage(stageKey).length}
                  </Badge>
                </Button>
              ))}
            </div>
          </div>

          {selectedMetrics.length === 0 ? (
            <Card>
              <CardContent className="p-8 text-center">
                <TrendingUp className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <h3 className="font-medium text-gray-900 mb-2">No Metrics to Display</h3>
                <p className="text-gray-500 mb-4">
                  Select metrics first to see them organized by customer journey stage
                </p>
                <Button onClick={() => setActiveTab('select-metrics')} variant="outline">
                  Select Metrics
                </Button>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-6">
              {Object.entries(JOURNEY_STAGES).map(([stageKey, stage]) => {
                const stageMetrics = getMetricsForStage(stageKey)
                
                return (
                  <Card key={stageKey} className={stageKey === activeStage ? 'ring-2 ring-blue-200' : ''}>
                    <CardHeader className={`pb-3 ${getStageColorClasses(stageKey)}`}>
                      <CardTitle className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <div className="w-3 h-3 rounded-full bg-current"></div>
                          <span>{stage.name} Stage</span>
                        </div>
                        <Badge variant="outline" className="bg-white">
                          {stageMetrics.length} metrics
                        </Badge>
                      </CardTitle>
                      <p className="text-sm opacity-75">{stage.description}</p>
                    </CardHeader>
                    <CardContent>
                      {stageMetrics.length === 0 ? (
                        <p className="text-sm text-gray-500 text-center py-4">
                          No metrics selected for this stage
                        </p>
                      ) : (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                          {stageMetrics.map(metric => (
                            <div key={metric.id} className="p-3 bg-gray-50 rounded-lg">
                              <h4 className="font-medium text-sm mb-2">{metric.name}</h4>
                              <div className="space-y-1 text-xs">
                                <div className="flex justify-between">
                                  <span className="text-gray-500">Current:</span>
                                  <span>{metric.currentValue || 'Not set'} {metric.unit}</span>
                                </div>
                                <div className="flex justify-between">
                                  <span className="text-gray-500">Target:</span>
                                  <span className="font-medium">{metric.targetValue || 'Not set'} {metric.unit}</span>
                                </div>
                                <div className="flex justify-between">
                                  <span className="text-gray-500">Frequency:</span>
                                  <span className="capitalize">{metric.frequency}</span>
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                    </CardContent>
                  </Card>
                )
              })}
            </div>
          )}
        </TabsContent>
      </Tabs>

      {/* Navigation */}
      <div className="flex justify-between pt-6">
        <Button onClick={onBack} variant="outline">
          Back
        </Button>
        <Button onClick={onNext} disabled={selectedMetrics.length === 0}>
          Continue
        </Button>
      </div>
    </div>
  )
}