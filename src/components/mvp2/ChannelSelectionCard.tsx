import React, { useState } from 'react'
import { Checkbox } from '../ui/checkbox'
import { Label } from '../ui/label'
import { Badge } from '../ui/badge'
import { Button } from '../ui/button'
import { Card, CardContent } from '../ui/card'
import { 
  TooltipProvider, 
  Tooltip, 
  TooltipTrigger, 
  TooltipContent 
} from '../ui/tooltip'
import { HelpCircle, AlertCircle, Settings, CheckCircle } from 'lucide-react'
import { useChannelStore } from '../../stores/useChannelStore'
import { ChannelData, ChannelOption } from '../../types/marketing'
import { useToast } from '../../hooks/use-toast'

interface ChannelCategoryProps {
  name: string
  description: string
  icon: React.ReactNode
  options: ChannelOption[]
  tooltips: Record<string, string>
}

interface ChannelSelectionCardProps {
  categoryKey: string
  category: ChannelCategoryProps
  getChannelMetrics: (channelId: string) => string[]
  onConfigureChannel?: (channelId: string) => void
}

export function ChannelSelectionCard({ 
  categoryKey, 
  category, 
  getChannelMetrics,
  onConfigureChannel 
}: ChannelSelectionCardProps) {
  const { 
    channels, 
    activeChannelId,
    addChannel, 
    removeChannel, 
    setActiveChannelId 
  } = useChannelStore()
  
  const { toast } = useToast()
  
  // Toggle channel selection
  const toggleChannel = (channelId: string, channelData: ChannelOption) => {
    const exists = channels.some(c => c.id === channelId)
    
    if (exists) {
      // If we're removing the currently edited channel, clear the editing channel
      if (activeChannelId === channelId) {
        setActiveChannelId(null)
      }
      removeChannel(channelId)
      toast({
        title: "Channel removed",
        description: `${channelData.name} has been removed from your selection.`
      })
    } else {
      // Create the new channel with proper typing
      const newChannel: ChannelData = {
        id: channelId,
        name: channelData.name,
        priority: '', // don't set a default priority, let user choose explicitly
        goals: [], // initialize empty goals array
        metrics: [],
        kpis: [],
        notes: '',
        integrations: []
      }
      
      // Add it to the selected channels
      addChannel(newChannel)
      
      toast({
        title: "Channel added",
        description: `${channelData.name} has been added to your selection. Configure it to get started.`
      })
      
      // Automatically open the configuration if callback provided
      if (onConfigureChannel) {
        setTimeout(() => onConfigureChannel(channelId), 100)
      }
    }
  }

  // Open configuration for an existing channel
  const openConfigurationForChannel = (channelId: string) => {
    if (onConfigureChannel) {
      onConfigureChannel(channelId)
    }
  }

  return (
    <Card className="h-full">
      <CardContent className="p-4">
        <div className="mb-4">
          <div className="flex items-center gap-2 mb-2">
            <div className="p-1.5 rounded-md bg-blue-50">
              {category.icon}
            </div>
            <h3 className="text-lg font-semibold text-blue-900">{category.name}</h3>
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <div className="p-1 rounded-full hover:bg-blue-100 transition-all">
                    <HelpCircle className="h-5 w-5 text-blue-500 cursor-pointer hover:text-blue-700 transition-colors" />
                  </div>
                </TooltipTrigger>
                <TooltipContent className="max-w-sm p-3">
                  <p className="text-sm">{category.description}</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          </div>
          <div className="bg-gradient-to-r from-blue-100 to-transparent h-px mb-3"></div>
        </div>
        
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 md:gap-4 mt-4">
          {category.options.map(option => {
            const isSelected = channels.some(c => c.id === option.id)
            const channel = channels.find(c => c.id === option.id)
            const priority = channel?.priority || ''
            
            return (
              <div 
                key={option.id} 
                className={`p-3 rounded-lg border transition-all h-full ${
                  isSelected 
                    ? 'border-blue-300 bg-blue-50 shadow-sm' 
                    : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
                }`}
              >
                <div className="flex items-start gap-2">
                  <Checkbox 
                    id={`channel-${option.id}`}
                    checked={isSelected}
                    onCheckedChange={() => toggleChannel(option.id, option)}
                    className="mt-1"
                  />
                  <div className="flex-1">
                    <div className="flex flex-wrap items-center justify-between gap-1">
                      <div className="flex items-center flex-wrap gap-1">
                        <Label 
                          htmlFor={`channel-${option.id}`} 
                          className={`font-medium text-sm cursor-pointer ${isSelected ? 'text-blue-700' : ''}`}
                        >
                          {option.name}
                        </Label>
                        {isSelected && priority === 'primary' && (
                          <Badge className="bg-blue-100 text-blue-700 hover:bg-blue-200 text-xs py-0">Primary</Badge>
                        )}
                        {isSelected && priority === 'secondary' && (
                          <Badge className="bg-gray-100 text-gray-700 hover:bg-gray-200 text-xs py-0">Secondary</Badge>
                        )}
                        {isSelected && priority === 'experimental' && (
                          <Badge className="bg-amber-100 text-amber-700 hover:bg-amber-200 text-xs py-0">Experimental</Badge>
                        )}
                      </div>
                      
                      {isSelected && (
                        <Button 
                          size="sm"
                          variant="ghost" 
                          className="h-7 px-1.5 text-xs min-w-0 sm:px-2"
                          onClick={() => openConfigurationForChannel(option.id)}
                        >
                          <Settings className="h-3.5 w-3.5 mr-0.5 sm:mr-1" />
                          <span className="hidden xs:inline">Config</span>
                          <span className="inline xs:hidden">Set</span>
                        </Button>
                      )}
                    </div>
                    <p className="text-xs text-gray-600 mt-1 leading-relaxed">{option.description}</p>
                    
                    {/* Configuration Status Indicators */}
                    {isSelected && (
                      <div className="flex flex-wrap gap-1 mt-2">
                        {/* Priority Status */}
                        <TooltipProvider>
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <div className={`text-xs rounded px-1.5 py-0.5 flex items-center gap-1 ${
                                priority 
                                  ? 'bg-green-50 text-green-700 border border-green-200' 
                                  : 'bg-amber-50 text-amber-700 border border-amber-200'
                              }`}>
                                {priority 
                                  ? <CheckCircle className="h-2.5 w-2.5" /> 
                                  : <AlertCircle className="h-2.5 w-2.5" />}
                                <span>Priority</span>
                              </div>
                            </TooltipTrigger>
                            <TooltipContent side="bottom">
                              <p className="text-xs">
                                {priority 
                                  ? `Set as ${priority} priority` 
                                  : "No priority level set"}
                              </p>
                            </TooltipContent>
                          </Tooltip>
                        </TooltipProvider>

                        {/* Primary Goals Status */}
                        <TooltipProvider>
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <div className={`text-xs rounded px-1.5 py-0.5 flex items-center gap-1 ${
                                channel?.goals && channel.goals.length > 0 
                                  ? 'bg-green-50 text-green-700 border border-green-200' 
                                  : 'bg-amber-50 text-amber-700 border border-amber-200'
                              }`}>
                                {channel?.goals && channel.goals.length > 0 
                                  ? <CheckCircle className="h-2.5 w-2.5" /> 
                                  : <AlertCircle className="h-2.5 w-2.5" />}
                                <span>Goals</span>
                              </div>
                            </TooltipTrigger>
                            <TooltipContent side="bottom">
                              <p className="text-xs">
                                {channel?.goals && channel.goals.length > 0 
                                  ? `${channel.goals.length} primary goals selected` 
                                  : "No primary goals selected"}
                              </p>
                            </TooltipContent>
                          </Tooltip>
                        </TooltipProvider>
                        
                        {/* Key Performance Metrics Status */}
                        <TooltipProvider>
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <div className={`text-xs rounded px-1.5 py-0.5 flex items-center gap-1 ${
                                channel?.metrics && channel.metrics.length > 0 
                                  ? 'bg-green-50 text-green-700 border border-green-200' 
                                  : 'bg-amber-50 text-amber-700 border border-amber-200'
                              }`}>
                                {channel?.metrics && channel.metrics.length > 0 
                                  ? <CheckCircle className="h-2.5 w-2.5" /> 
                                  : <AlertCircle className="h-2.5 w-2.5" />}
                                <span>Metrics</span>
                              </div>
                            </TooltipTrigger>
                            <TooltipContent side="bottom">
                              <p className="text-xs">
                                {channel?.metrics && channel.metrics.length > 0 
                                  ? `${channel.metrics.length} metrics selected` 
                                  : "No performance metrics selected"}
                              </p>
                            </TooltipContent>
                          </Tooltip>
                        </TooltipProvider>
                        
                        {/* KPI Targets Status */}
                        <TooltipProvider>
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <div className={`text-xs rounded px-1.5 py-0.5 flex items-center gap-1 ${
                                channel?.kpis && channel.kpis.filter(k => k.target && k.target.length > 0).length > 0 
                                  ? 'bg-green-50 text-green-700 border border-green-200' 
                                  : 'bg-amber-50 text-amber-700 border border-amber-200'
                              }`}>
                                {channel?.kpis && channel.kpis.filter(k => k.target && k.target.length > 0).length > 0
                                  ? <CheckCircle className="h-2.5 w-2.5" /> 
                                  : <AlertCircle className="h-2.5 w-2.5" />}
                                <span>KPIs</span>
                              </div>
                            </TooltipTrigger>
                            <TooltipContent side="bottom">
                              <p className="text-xs">
                                {channel?.kpis && channel.kpis.filter(k => k.target && k.target.length > 0).length > 0
                                  ? `${channel.kpis.filter(k => k.target && k.target.length > 0).length} KPI targets set` 
                                  : "No KPI targets set"}
                              </p>
                            </TooltipContent>
                          </Tooltip>
                        </TooltipProvider>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      </CardContent>
    </Card>
  )
}