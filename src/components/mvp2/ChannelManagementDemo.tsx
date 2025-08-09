import React, { useState } from 'react'
import { ChannelSelectionCard } from './ChannelSelectionCard'
import { ChannelConfigurationCard } from './ChannelConfigurationCard'
import { SuccessMetrics } from '../onboarding/SuccessMetrics'
import { CHANNEL_CATEGORIES, getChannelMetrics } from '../../data/channelData'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../ui/tabs'

export function ChannelManagementDemo() {
  const [activeTab, setActiveTab] = useState('channel-selection')

  const handleNavigateToSelection = () => {
    setActiveTab('channel-selection')
  }

  return (
    <div className="max-w-7xl mx-auto p-6">
      <div className="text-center mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Channel Management System</h1>
        <p className="text-gray-600">
          Select, configure, and optimize your marketing channels with AI-powered recommendations
        </p>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="channel-selection">Channel Selection</TabsTrigger>
          <TabsTrigger value="channel-overview">Channel Overview</TabsTrigger>
          <TabsTrigger value="success-metrics">Success Metrics</TabsTrigger>
        </TabsList>

        <TabsContent value="channel-selection" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Main Content Area */}
            <div className="lg:col-span-2">
              <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
                {Object.entries(CHANNEL_CATEGORIES).map(([key, category]) => (
                  <ChannelSelectionCard
                    key={key}
                    categoryKey={key}
                    category={category}
                    getChannelMetrics={getChannelMetrics}
                  />
                ))}
              </div>
            </div>

            {/* Configuration Sidebar */}
            <div className="lg:col-span-1">
              <ChannelConfigurationCard
                activeTab={activeTab}
                getChannelMetrics={getChannelMetrics}
                onNavigateToSelection={handleNavigateToSelection}
              />
            </div>
          </div>
        </TabsContent>

        <TabsContent value="channel-overview" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Main Content Area */}
            <div className="lg:col-span-2">
              <div className="bg-white rounded-lg border p-6">
                <h2 className="text-xl font-semibold mb-4">Channel Performance Overview</h2>
                <p className="text-gray-600 mb-4">
                  Monitor your configured channels and track their performance metrics.
                </p>
                <div className="bg-blue-50 rounded-lg p-4 border border-blue-200">
                  <p className="text-blue-800 text-sm">
                    📊 This section will show analytics and performance data for your configured channels.
                    Configure channels in the "Channel Selection" tab to see their metrics here.
                  </p>
                </div>
              </div>
            </div>

            {/* Configuration Sidebar */}
            <div className="lg:col-span-1">
              <ChannelConfigurationCard
                activeTab={activeTab}
                getChannelMetrics={getChannelMetrics}
                onNavigateToSelection={handleNavigateToSelection}
              />
            </div>
          </div>
        </TabsContent>

        <TabsContent value="success-metrics" className="space-y-6">
          <SuccessMetrics 
            onNext={() => console.log('Success metrics completed')}
            onBack={() => setActiveTab('channel-overview')}
          />
        </TabsContent>
      </Tabs>

      {/* Feature Highlights */}
      <div className="mt-12 grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-xl p-6 border border-blue-200">
          <div className="w-12 h-12 bg-blue-600 rounded-lg flex items-center justify-center mb-4">
            <span className="text-white font-bold text-xl">AI</span>
          </div>
          <h3 className="font-semibold text-blue-900 mb-2">AI-Powered Recommendations</h3>
          <p className="text-blue-700 text-sm">
            Generate strategic notes and KPI targets based on industry benchmarks and best practices.
          </p>
        </div>

        <div className="bg-gradient-to-br from-green-50 to-green-100 rounded-xl p-6 border border-green-200">
          <div className="w-12 h-12 bg-green-600 rounded-lg flex items-center justify-center mb-4">
            <span className="text-white font-bold text-xl">📊</span>
          </div>
          <h3 className="font-semibold text-green-900 mb-2">Smart Metrics Tracking</h3>
          <p className="text-green-700 text-sm">
            Track the right metrics for each channel with automated KPI suggestions and target setting.
          </p>
        </div>

        <div className="bg-gradient-to-br from-purple-50 to-purple-100 rounded-xl p-6 border border-purple-200">
          <div className="w-12 h-12 bg-purple-600 rounded-lg flex items-center justify-center mb-4">
            <span className="text-white font-bold text-xl">⚡</span>
          </div>
          <h3 className="font-semibold text-purple-900 mb-2">Priority-Based Strategy</h3>
          <p className="text-purple-700 text-sm">
            Organize channels by priority (Primary, Secondary, Experimental) for focused execution.
          </p>
        </div>
      </div>
    </div>
  )
}