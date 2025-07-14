import React, { useState } from 'react';
import { useSlottedContext } from '../../contexts/SlottedContext';
import { aiOrchestrator } from '../../services/ai/aiOrchestrator';

interface Campaign {
  week: number;
  title: string;
  description: string;
  primaryChannel: string;
  secondaryChannels: string[];
  contentTypes: string[];
  status: 'planned' | 'in-progress' | 'completed';
  driveFolderUrl?: string;
}

interface CampaignManagerProps {
  onCampaignSelect?: (campaign: Campaign) => void;
}

export const CampaignManager: React.FC<CampaignManagerProps> = ({ onCampaignSelect }) => {
  const { context } = useSlottedContext();
  const [campaigns, setCampaigns] = useState<Campaign[]>([]);
  const [isGenerating, setIsGenerating] = useState(false);
  const [isCreatingAssets, setIsCreatingAssets] = useState(false);
  const [selectedWeek, setSelectedWeek] = useState<number | null>(null);

  const handleGenerateCampaigns = async () => {
    if (!context || !aiOrchestrator.isConfigured()) {
      alert('Please complete onboarding and configure AI providers first');
      return;
    }

    setIsGenerating(true);
    try {
      const response = await fetch(`${process.env.REACT_APP_BACKEND_URL || 'http://localhost:3001'}/api/campaigns/generate-topics`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          mcpContext: context,
          weeks: 13,
          aiConfig: {
            provider: 'openai', // This should come from your AI config
            model: 'gpt-4o',
            apiKey: 'stored-securely', // In production, handle securely
          },
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to generate campaigns');
      }

      const data = await response.json();
      const generatedCampaigns: Campaign[] = data.topics.map((topic: any, index: number) => ({
        week: index + 1,
        title: topic.title || topic,
        description: topic.description || `Campaign focus for week ${index + 1}`,
        primaryChannel: topic.primaryChannel || context.marketingGoals?.channels?.primary?.[0] || 'Blog',
        secondaryChannels: topic.secondaryChannels || context.marketingGoals?.channels?.secondary || ['Social Media'],
        contentTypes: topic.contentTypes || ['blog', 'social'],
        status: 'planned' as const,
      }));

      setCampaigns(generatedCampaigns);
      alert(`Generated ${generatedCampaigns.length} campaign topics successfully!`);
    } catch (error) {
      console.error('Failed to generate campaigns:', error);
      alert(`Failed to generate campaigns: ${error instanceof Error ? error.message : 'Unknown error'}`);
    } finally {
      setIsGenerating(false);
    }
  };

  const handleCreateAssets = async () => {
    if (!context || campaigns.length === 0) {
      alert('Please generate campaigns first');
      return;
    }

    const isGoogleConfigured = localStorage.getItem('google_workspace_configured') === 'true';
    if (!isGoogleConfigured) {
      alert('Please configure Google Workspace first to create Drive folders and calendar');
      return;
    }

    setIsCreatingAssets(true);
    try {
      // Create Google Sheets calendar
      const credentials = localStorage.getItem('google_credentials');
      const calendarResponse = await fetch(`${process.env.REACT_APP_BACKEND_URL || 'http://localhost:3001'}/api/google/sheets/create-campaign-calendar`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          companyName: context.company.name,
          campaigns: campaigns.map(c => c.title),
          config: JSON.parse(credentials!),
          mcpContext: context,
        }),
      });

      if (!calendarResponse.ok) {
        throw new Error('Failed to create campaign calendar');
      }

      const calendarData = await calendarResponse.json();
      
      // Create company root folder
      const folderResponse = await fetch(`${process.env.REACT_APP_BACKEND_URL || 'http://localhost:3001'}/api/google/drive/create-company-folder`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          companyName: context.company.name,
          config: JSON.parse(credentials!),
        }),
      });

      if (!folderResponse.ok) {
        throw new Error('Failed to create company folder');
      }

      const folderData = await folderResponse.json();

      alert(`Assets created successfully!\n\n📊 Campaign Calendar: ${calendarData.url}\n📁 Drive Folder: ${folderData.webViewLink}\n\nYou can now start creating content for each campaign.`);
    } catch (error) {
      console.error('Failed to create assets:', error);
      alert(`Failed to create assets: ${error instanceof Error ? error.message : 'Unknown error'}`);
    } finally {
      setIsCreatingAssets(false);
    }
  };

  const handleCampaignClick = (campaign: Campaign) => {
    setSelectedWeek(campaign.week);
    onCampaignSelect?.(campaign);
  };

  const getStatusColor = (status: Campaign['status']) => {
    const colors = {
      planned: 'bg-yellow-100 text-yellow-800',
      'in-progress': 'bg-blue-100 text-blue-800',
      completed: 'bg-green-100 text-green-800',
    };
    return colors[status];
  };

  if (!context) {
    return (
      <div className="bg-white rounded-lg shadow p-6">
        <div className="text-center py-8">
          <p className="text-gray-500">Please complete onboarding to access campaign management</p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow p-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-xl font-semibold text-gray-900">Campaign Management</h2>
          <p className="text-sm text-gray-600">13-week marketing campaign planner</p>
        </div>
        <div className="flex space-x-3">
          <button
            onClick={handleGenerateCampaigns}
            disabled={isGenerating || !aiOrchestrator.isConfigured()}
            className="px-4 py-2 bg-brand-primary text-white rounded-md hover:bg-brand-secondary disabled:opacity-50 text-sm"
          >
            {isGenerating ? 'Generating...' : 'Generate Campaigns'}
          </button>
          {campaigns.length > 0 && (
            <button
              onClick={handleCreateAssets}
              disabled={isCreatingAssets}
              className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 disabled:opacity-50 text-sm"
            >
              {isCreatingAssets ? 'Creating...' : 'Create Assets'}
            </button>
          )}
        </div>
      </div>

      {campaigns.length === 0 ? (
        <div className="text-center py-12">
          <div className="text-gray-400 mb-4">
            <svg className="w-16 h-16 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
            </svg>
          </div>
          <p className="text-gray-500 mb-4">No campaigns generated yet</p>
          <p className="text-sm text-gray-400">
            {!aiOrchestrator.isConfigured() 
              ? 'Configure AI providers first, then generate your 13-week campaign strategy'
              : 'Click "Generate Campaigns" to create your 13-week marketing strategy'
            }
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {campaigns.map((campaign) => (
            <div
              key={campaign.week}
              onClick={() => handleCampaignClick(campaign)}
              className={`p-4 border rounded-lg cursor-pointer transition-colors ${
                selectedWeek === campaign.week
                  ? 'border-brand-primary bg-brand-primary bg-opacity-5'
                  : 'border-gray-200 hover:border-gray-300'
              }`}
            >
              <div className="flex items-center justify-between">
                <div className="flex-1">
                  <div className="flex items-center space-x-3">
                    <span className="font-medium text-gray-900">Week {campaign.week}</span>
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(campaign.status)}`}>
                      {campaign.status}
                    </span>
                  </div>
                  <h3 className="font-medium text-gray-900 mt-1">{campaign.title}</h3>
                  <p className="text-sm text-gray-600 mt-1">{campaign.description}</p>
                  <div className="flex items-center space-x-4 mt-2 text-xs text-gray-500">
                    <span>📍 {campaign.primaryChannel}</span>
                    <span>📝 {campaign.contentTypes.join(', ')}</span>
                  </div>
                </div>
                <div className="ml-4">
                  <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {campaigns.length > 0 && (
        <div className="mt-6 p-4 bg-blue-50 rounded-md">
          <h4 className="text-sm font-medium text-blue-800 mb-2">Next Steps</h4>
          <ul className="text-xs text-blue-700 space-y-1">
            <li>• Click "Create Assets" to generate Google Sheets calendar and Drive folders</li>
            <li>• Select individual campaigns to start content creation</li>
            <li>• Use the content generator to create blog posts, videos, and social media</li>
            <li>• Track progress and update campaign status as you complete content</li>
          </ul>
        </div>
      )}
    </div>
  );
};