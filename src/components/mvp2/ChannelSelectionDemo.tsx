import React from 'react'
import { ChannelSelectionCard } from './ChannelSelectionCard'
import { CHANNEL_CATEGORIES, getChannelMetrics } from '../../data/channelData'

export function ChannelSelectionDemo() {
  const handleConfigureChannel = (channelId: string) => {
    console.log('Configure channel:', channelId)
    // This would typically open a drawer or modal for channel configuration
    alert(`Configure channel: ${channelId}`)
  }

  return (
    <div className="space-y-6">
      <div className="text-center mb-8">
        <h2 className="text-2xl font-bold text-gray-900 mb-2">Channel Configuration</h2>
        <p className="text-gray-600">
          Select and configure your marketing channels for optimal reach and engagement
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {Object.entries(CHANNEL_CATEGORIES).map(([key, category]) => (
          <ChannelSelectionCard
            key={key}
            categoryKey={key}
            category={category}
            getChannelMetrics={getChannelMetrics}
            onConfigureChannel={handleConfigureChannel}
          />
        ))}
      </div>

      {/* Display selected channels summary */}
      <div className="mt-8 p-4 bg-blue-50 rounded-lg">
        <h3 className="font-semibold text-blue-900 mb-2">Selected Channels Summary</h3>
        <p className="text-sm text-blue-700">
          Use the configuration buttons to set priorities, goals, and KPIs for each selected channel.
          This helps create a comprehensive marketing strategy tailored to your business objectives.
        </p>
      </div>
    </div>
  )
}