import React, { useState } from 'react'
import { Button } from '../ui/button'
import { Card, CardContent } from '../ui/card'
import { Badge } from '../ui/badge'
import { Label } from '../ui/label'
import { Input } from '../ui/input'
import { Textarea } from '../ui/textarea'
import { Checkbox } from '../ui/checkbox'
import { 
  TooltipProvider, 
  Tooltip, 
  TooltipTrigger, 
  TooltipContent 
} from '../ui/tooltip'
import { Loader2, Sparkles, XCircle, Info, HelpCircle } from 'lucide-react'
import { 
  useChannelStore, 
  generateChannelNotes, 
  generateKpiTargets,
  KpiTarget
} from '../../stores/useChannelStore'
import { useToast } from '../../hooks/use-toast'

interface ChannelConfigurationCardProps {
  activeTab?: string
  getChannelMetrics: (channelId: string) => string[]
  onNavigateToSelection?: () => void
}

export function ChannelConfigurationCard({ 
  activeTab = 'channel-selection', 
  getChannelMetrics,
  onNavigateToSelection 
}: ChannelConfigurationCardProps) {
  const { 
    channels, 
    activeChannelId,
    setActiveChannelId,
    setChannelMetrics,
    setChannelKPITarget,
    setChannelNotes,
    setChannelPriority
  } = useChannelStore()

  const { toast } = useToast()
  const [generatingNotes, setGeneratingNotes] = useState(false)
  const [generatingTargets, setGeneratingTargets] = useState(false)
  const [kpiTargets, setKpiTargets] = useState<Record<string, KpiTarget>>({})

  // Get the active channel
  const activeChannel = channels.find(c => c.id === activeChannelId)
  
  // Count of channels by priority
  const primaryChannelsCount = channels.filter(c => c.priority === 'primary').length
  const channelsNeedingPriorityCount = channels.filter(c => c.priority === '').length

  // Function to generate AI-powered notes
  const handleGenerateNotes = async () => {
    if (!activeChannel) return
    
    setGeneratingNotes(true)
    try {
      const generatedNotes = await generateChannelNotes(activeChannel.id)
      setChannelNotes(activeChannel.id, generatedNotes)
      toast({
        title: "AI notes generated",
        description: "Strategic recommendations have been added to your channel."
      })
    } catch (error) {
      console.error('Error generating notes:', error)
      toast({
        title: "Generation failed",
        description: "Unable to generate AI recommendations. Please try again.",
        variant: "destructive"
      })
    } finally {
      setGeneratingNotes(false)
    }
  }
  
  // Function to generate KPI targets
  const handleGenerateTargets = async () => {
    if (!activeChannel || activeChannel.metrics.length === 0) return
    
    setGeneratingTargets(true)
    setKpiTargets({})
    
    try {
      // Call the AI-powered KPI target generator
      const targets = await generateKpiTargets(activeChannel.id)
      
      // Update the targets in the store
      Object.entries(targets).forEach(([metric, data]) => {
        setChannelKPITarget(activeChannel.id, metric, data.target)
      })
      
      // Save the full target data (including rationales) for display
      setKpiTargets(targets)
      
      toast({
        title: "KPI targets generated",
        description: `Generated targets for ${Object.keys(targets).length} metrics based on industry benchmarks.`
      })
    } catch (error) {
      console.error('Error generating KPI targets:', error)
      toast({
        title: "Generation failed",
        description: "Unable to generate KPI targets. Please try again.",
        variant: "destructive"
      })
    } finally {
      setGeneratingTargets(false)
    }
  }

  // Helper function to capitalize text
  const capitalize = (text: string) => {
    return text.charAt(0).toUpperCase() + text.slice(1)
  }

  return (
    <Card className="sticky top-4">
      <CardContent className="p-4">
        {activeTab === 'channel-selection' ? (
          <>
            {activeChannel ? (
              <div className="space-y-4">
                <div className="flex justify-between items-center pb-3 border-b border-blue-100">
                  <div className="flex items-center">
                    <div className="w-2 h-10 bg-blue-500 rounded-sm mr-3"></div>
                    <h3 className="font-semibold text-lg text-blue-900">Configure: {activeChannel.name}</h3>
                  </div>
                  <Button 
                    variant="ghost" 
                    size="sm"
                    className="hover:bg-gray-100 transition-colors"
                    onClick={() => setActiveChannelId(null)}
                  >
                    <XCircle className="h-4 w-4 mr-1" />
                    Close
                  </Button>
                </div>
                
                <div className="space-y-3">
                  <div>
                    <Label className="text-sm font-medium">Channel Priority</Label>
                    {!activeChannel.priority && (
                      <p className="text-xs text-amber-600 mb-1">Please select a priority for this channel</p>
                    )}
                    <div className="flex gap-2 mt-1">
                      <Button 
                        size="sm" 
                        variant="outline"
                        className={`border-2 transition-all ${
                          activeChannel.priority === 'primary' 
                            ? 'bg-blue-50 border-blue-500 text-blue-700 font-medium shadow-sm' 
                            : 'hover:bg-blue-50 hover:border-blue-200'
                        }`}
                        onClick={() => setChannelPriority(activeChannel.id, 'primary')}
                      >
                        <div className="w-3 h-3 rounded-full bg-blue-600 mr-1.5"></div>
                        Primary
                      </Button>
                      <Button 
                        size="sm" 
                        variant="outline"
                        className={`border-2 transition-all ${
                          activeChannel.priority === 'secondary' 
                            ? 'bg-gray-50 border-gray-500 text-gray-700 font-medium shadow-sm' 
                            : 'hover:bg-gray-50 hover:border-gray-200'
                        }`}
                        onClick={() => setChannelPriority(activeChannel.id, 'secondary')}
                      >
                        <div className="w-3 h-3 rounded-full bg-gray-600 mr-1.5"></div>
                        Secondary
                      </Button>
                      <Button 
                        size="sm" 
                        variant="outline"
                        className={`border-2 transition-all ${
                          activeChannel.priority === 'experimental' 
                            ? 'bg-amber-50 border-amber-500 text-amber-700 font-medium shadow-sm' 
                            : 'hover:bg-amber-50 hover:border-amber-200'
                        }`}
                        onClick={() => setChannelPriority(activeChannel.id, 'experimental')}
                      >
                        <div className="w-3 h-3 rounded-full bg-amber-600 mr-1.5"></div>
                        Experimental
                      </Button>
                    </div>
                  </div>
                  
                  <div>
                    <Label className="text-sm font-medium">Key Performance Metrics</Label>
                    <p className="text-xs text-gray-500 mb-2">Select metrics to track for this channel:</p>
                    
                    <div className="grid grid-cols-2 gap-2 mb-3">
                      {getChannelMetrics(activeChannel.id).map(metric => (
                        <div key={metric} className="flex items-center space-x-2">
                          <Checkbox 
                            id={`metric-${activeChannel.id}-${metric}`}
                            checked={activeChannel.metrics.includes(metric)}
                            onCheckedChange={(checked) => {
                              if (checked) {
                                setChannelMetrics(
                                  activeChannel.id, 
                                  [...activeChannel.metrics, metric]
                                )
                              } else {
                                setChannelMetrics(
                                  activeChannel.id, 
                                  activeChannel.metrics.filter(m => m !== metric)
                                )
                              }
                            }}
                          />
                          <Label 
                            htmlFor={`metric-${activeChannel.id}-${metric}`}
                            className="text-sm cursor-pointer"
                          >
                            {metric.replace(/_/g, ' ')}
                          </Label>
                        </div>
                      ))}
                    </div>
                  </div>
                  
                  {activeChannel.metrics.length > 0 && (
                    <div>
                      <div className="flex justify-between items-center mb-1">
                        <Label className="text-sm font-medium">KPI Targets</Label>
                        <TooltipProvider>
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <Button
                                type="button" 
                                size="sm"
                                variant="outline"
                                className="h-7 text-xs flex gap-1 items-center px-2"
                                onClick={handleGenerateTargets}
                                disabled={generatingTargets || !activeChannel.priority}
                              >
                                {generatingTargets ? (
                                  <Loader2 className="h-4 w-4 animate-spin" />
                                ) : (
                                  <Sparkles className="h-4 w-4" />
                                )}
                              </Button>
                            </TooltipTrigger>
                            <TooltipContent className="p-2">
                              <p className="text-xs">Auto-generate industry-standard targets</p>
                            </TooltipContent>
                          </Tooltip>
                        </TooltipProvider>
                      </div>
                      <p className="text-xs text-gray-500 mb-2">
                        Set industry-standard targets for each metric. 
                        <span className="text-blue-600">
                          {!activeChannel.priority 
                            ? ' Note: Channel priority must be assigned before auto-generating targets.'
                            : ' Tip: Use auto-generate to set benchmark values based on industry data.'}
                        </span>
                      </p>
                      
                      <div className="space-y-3">
                        {activeChannel.kpis.map((kpi, index) => {
                          const metricName = kpi.name || kpi.metric || activeChannel.metrics[index]
                          return (
                            <div key={index} className="grid grid-cols-2 gap-2 items-center">
                              <div className="flex items-center gap-1.5">
                                <Label className="text-xs">{metricName?.replace(/_/g, ' ')}</Label>
                                {kpiTargets[metricName] && (
                                  <TooltipProvider>
                                    <Tooltip>
                                      <TooltipTrigger asChild>
                                        <div>
                                          <HelpCircle className="h-3 w-3 text-blue-500 cursor-help" />
                                        </div>
                                      </TooltipTrigger>
                                      <TooltipContent className="max-w-[250px] p-3">
                                        <p className="text-xs">{kpiTargets[metricName].rationale}</p>
                                      </TooltipContent>
                                    </Tooltip>
                                  </TooltipProvider>
                                )}
                              </div>
                              <Input
                                value={kpi.target}
                                onChange={(e) => setChannelKPITarget(
                                  activeChannel.id,
                                  metricName,
                                  e.target.value
                                )}
                                placeholder="Set target"
                                className={`h-8 text-sm ${kpiTargets[metricName] ? 'border-blue-200 bg-blue-50' : ''}`}
                              />
                            </div>
                          )
                        })}
                      </div>
                    </div>
                  )}
                  
                  <div>
                    <div className="flex justify-between items-center mb-1">
                      <Label className="text-sm font-medium">Channel Notes</Label>
                      {activeChannel.priority && activeChannel.metrics.length > 0 && (
                        <TooltipProvider>
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <Button
                                type="button" 
                                size="sm"
                                variant="outline"
                                className="h-7 text-xs flex gap-1 items-center px-2"
                                onClick={handleGenerateNotes}
                                disabled={generatingNotes}
                              >
                                {generatingNotes ? (
                                  <Loader2 className="h-4 w-4 animate-spin" />
                                ) : (
                                  <Sparkles className="h-4 w-4" />
                                )}
                              </Button>
                            </TooltipTrigger>
                            <TooltipContent className="p-2">
                              <p className="text-xs">Auto-generate strategic channel notes</p>
                            </TooltipContent>
                          </Tooltip>
                        </TooltipProvider>
                      )}
                    </div>
                    <p className="text-xs text-gray-500 mb-2">
                      {activeChannel.priority && activeChannel.metrics.length > 0 ? (
                        <span>Add strategic notes for this channel or use auto-generate to create recommendations.</span>
                      ) : (
                        <span className="text-amber-600">To enable AI-powered notes generation, first select a channel priority and at least one metric.</span>
                      )}
                    </p>
                    <Textarea
                      value={activeChannel.notes}
                      onChange={(e) => setChannelNotes(activeChannel.id, e.target.value)}
                      placeholder="Add notes about how you'll use this channel..."
                      className="mt-1 h-24"
                      disabled={generatingNotes}
                    />
                  </div>
                </div>
              </div>
            ) : channels.length > 0 ? (
              <div className="space-y-5">
                <div className="flex items-center gap-2 mb-4">
                  <div className="relative w-7 h-7 flex items-center justify-center bg-gradient-to-br from-blue-500 to-blue-700 rounded-full">
                    <span className="text-white text-xs font-bold">{channels.length}</span>
                  </div>
                  <h3 className="font-medium text-lg text-blue-900">Selected Channels</h3>
                </div>
                
                <div className="space-y-4">
                  <div>
                    <div className="flex items-center gap-2 mb-2">
                      <div className="w-3 h-3 rounded-full bg-blue-600"></div>
                      <h4 className="text-sm font-medium text-blue-800">Primary Channels ({primaryChannelsCount})</h4>
                    </div>
                    
                    {channels.filter(c => c.priority === 'primary').length === 0 ? (
                      <div className="bg-gray-50 rounded-md border border-dashed border-gray-300 p-3">
                        <p className="text-sm text-center text-gray-500">No primary channels selected yet</p>
                      </div>
                    ) : (
                      <div className="space-y-1">
                        {channels
                          .filter(c => c.priority === 'primary')
                          .map(channel => (
                            <div 
                              key={channel.id} 
                              className="flex justify-between items-center p-2.5 rounded-md border border-blue-100 bg-blue-50 cursor-pointer hover:bg-blue-100 hover:border-blue-200 transition-all"
                              onClick={() => setActiveChannelId(channel.id)}
                            >
                              <div className="flex items-center gap-2">
                                <span className="font-medium">{channel.name}</span>
                                <Badge variant="outline" className="text-xs bg-white border-blue-200 text-blue-700">
                                  {channel.metrics.length} metrics
                                </Badge>
                              </div>
                              <Button 
                                size="sm" 
                                variant="ghost"
                                className="h-7 text-xs"
                              >
                                Configure
                              </Button>
                            </div>
                          ))
                        }
                      </div>
                    )}
                  </div>
                </div>
                
                {/* Secondary and Experimental channels sections */}
                {channels.filter(c => c.priority === 'secondary').length > 0 && (
                  <div className="space-y-2">
                    <h4 className="text-sm font-medium text-gray-700">Secondary Channels</h4>
                    {channels
                      .filter(c => c.priority === 'secondary')
                      .map(channel => (
                        <div 
                          key={channel.id} 
                          className="flex justify-between items-center py-2 border-b cursor-pointer hover:bg-gray-50 px-2 rounded"
                          onClick={() => setActiveChannelId(channel.id)}
                        >
                          <span>{channel.name}</span>
                          <Button size="sm" variant="ghost">
                            <span className="text-gray-400">Edit</span>
                          </Button>
                        </div>
                      ))
                    }
                  </div>
                )}

                {channels.filter(c => c.priority === 'experimental').length > 0 && (
                  <div className="space-y-2">
                    <h4 className="text-sm font-medium text-amber-700">Experimental Channels</h4>
                    {channels
                      .filter(c => c.priority === 'experimental')
                      .map(channel => (
                        <div 
                          key={channel.id} 
                          className="flex justify-between items-center py-2 border-b cursor-pointer hover:bg-amber-50 px-2 rounded"
                          onClick={() => setActiveChannelId(channel.id)}
                        >
                          <span>{channel.name}</span>
                          <Button size="sm" variant="ghost">
                            <span className="text-gray-400">Edit</span>
                          </Button>
                        </div>
                      ))
                    }
                  </div>
                )}
                
                {/* Channels needing priority */}
                {channelsNeedingPriorityCount > 0 && (
                  <div className="space-y-2">
                    <h4 className="text-sm font-medium text-red-700">Channels Needing Priority</h4>
                    <p className="text-xs text-red-600 mb-2">Please assign a priority to these channels</p>
                    {channels
                      .filter(c => c.priority === '')
                      .map(channel => (
                        <div 
                          key={channel.id} 
                          className="flex justify-between items-center py-2 border-b cursor-pointer hover:bg-red-50 border-red-200 px-2 rounded bg-red-50/50"
                          onClick={() => setActiveChannelId(channel.id)}
                        >
                          <span>{channel.name}</span>
                          <Button 
                            size="sm" 
                            variant="outline"
                            className="border-red-200 text-red-700 hover:bg-red-100"
                          >
                            <span>Assign Priority</span>
                          </Button>
                        </div>
                      ))
                    }
                  </div>
                )}
              </div>
            ) : (
              <div className="p-6 text-center">
                <h3 className="font-medium text-gray-600 mb-1">No Channels Selected</h3>
                <p className="text-sm text-gray-500 mb-4">
                  Select channels to build your marketing strategy
                </p>
                {onNavigateToSelection && (
                  <Button onClick={onNavigateToSelection} variant="outline">
                    Select Channels
                  </Button>
                )}
              </div>
            )}
          </>
        ) : (
          // Channel Overview tab
          <div className="space-y-4">
            <h3 className="font-medium">Channel Information</h3>
            
            {activeChannel ? (
              <div className="p-4 border rounded bg-gray-50">
                <h4 className="font-medium mb-2">{activeChannel.name}</h4>
                
                <div className="mb-3">
                  <div className="text-sm font-medium mb-1">Channel Priority</div>
                  {activeChannel.priority ? (
                    <Badge className={`${
                      activeChannel.priority === 'primary' ? 'bg-blue-100 text-blue-700' : 
                      activeChannel.priority === 'secondary' ? 'bg-gray-100 text-gray-700' : 
                      'bg-amber-100 text-amber-700'
                    }`}>
                      {capitalize(activeChannel.priority)}
                    </Badge>
                  ) : (
                    <p className="text-xs text-amber-600">No priority assigned</p>
                  )}
                </div>
                
                {activeChannel.metrics.length > 0 && (
                  <div className="mb-3">
                    <div className="text-sm font-medium mb-1">Key Metrics</div>
                    <div className="flex flex-wrap gap-1">
                      {activeChannel.metrics.map(metric => (
                        <Badge key={metric} variant="outline" className="text-xs">
                          {metric.replace(/_/g, ' ')}
                        </Badge>
                      ))}
                    </div>
                  </div>
                )}
                
                {activeChannel.notes && (
                  <div>
                    <div className="text-sm font-medium mb-1">Notes</div>
                    <p className="text-xs text-gray-600">{activeChannel.notes}</p>
                  </div>
                )}
                
                <div className="flex gap-2 mt-4">
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={onNavigateToSelection}
                  >
                    Edit in Channel Selection
                  </Button>
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => setActiveChannelId(null)}
                  >
                    Close
                  </Button>
                </div>
              </div>
            ) : (
              <div className="p-4 border rounded bg-gray-50 text-center">
                <Info className="h-5 w-5 text-blue-500 mx-auto mb-2" />
                <p className="text-sm text-gray-600">Select a channel to view its details</p>
              </div>
            )}
            
            {channelsNeedingPriorityCount > 0 && (
              <div className="p-3 bg-amber-50 border border-amber-200 rounded-md">
                <div className="flex items-center gap-2 text-amber-800 mb-1">
                  <Info className="h-4 w-4" />
                  <span className="font-medium text-sm">Channels Needing Priority</span>
                </div>
                <p className="text-xs text-amber-700 mb-2">
                  {channelsNeedingPriorityCount} channel(s) need priority assignment
                </p>
                {onNavigateToSelection && (
                  <Button
                    size="sm"
                    variant="outline"
                    className="border-amber-200 text-amber-700 hover:bg-amber-100"
                    onClick={onNavigateToSelection}
                  >
                    Assign Priorities
                  </Button>
                )}
              </div>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  )
}