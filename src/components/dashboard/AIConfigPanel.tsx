import React, { useState, useEffect } from 'react';
import { aiOrchestrator, AIProvider, AIModel, AIConfig } from '../../services/ai/aiOrchestrator';

interface AIConfigPanelProps {
  onConfigured?: () => void;
}

export const AIConfigPanel: React.FC<AIConfigPanelProps> = ({ onConfigured }) => {
  const [isExpanded, setIsExpanded] = useState(false);
  // const [configs, setConfigs] = useState<AIConfig[]>([]);
  const [newConfig, setNewConfig] = useState<Partial<AIConfig>>({
    provider: 'openai',
    model: 'gpt-4o',
    temperature: 0.7,
    maxTokens: 4000,
  });
  const [isConfiguring, setIsConfiguring] = useState(false);
  const [configuredProviders, setConfiguredProviders] = useState<string[]>([]);

  useEffect(() => {
    setConfiguredProviders(aiOrchestrator.getConfiguredProviders());
  }, []);

  const providerModels: Record<AIProvider, AIModel[]> = {
    openai: ['gpt-4o', 'gpt-4'],
    anthropic: ['claude-3-5-sonnet', 'claude-3-haiku'],
  };

  const handleAddConfig = async () => {
    if (!newConfig.provider || !newConfig.model || !newConfig.apiKey) {
      alert('Please fill in all required fields');
      return;
    }

    setIsConfiguring(true);
    try {
      aiOrchestrator.configureProvider(newConfig as AIConfig);
      
      // setConfigs(prev => [...prev, newConfig as AIConfig]);
      setConfiguredProviders(aiOrchestrator.getConfiguredProviders());
      
      setNewConfig({
        provider: 'openai',
        model: 'gpt-4o',
        temperature: 0.7,
        maxTokens: 4000,
        apiKey: '',
      });
      
      onConfigured?.();
      alert('AI provider configured successfully!');
    } catch (error) {
      console.error('Failed to configure AI provider:', error);
      alert('Failed to configure AI provider. Please check your settings.');
    } finally {
      setIsConfiguring(false);
    }
  };

  const handleSetDefault = (provider: AIProvider, model: AIModel) => {
    aiOrchestrator.setDefaultProvider(provider, model);
    alert(`Set ${provider} ${model} as default`);
  };

  if (!isExpanded) {
    return (
      <div className="bg-white rounded-lg shadow p-4">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-lg font-semibold text-gray-900">AI Configuration</h3>
            <p className="text-sm text-gray-600">
              {configuredProviders.length > 0 
                ? `${configuredProviders.length} provider(s) configured`
                : 'No AI providers configured'
              }
            </p>
          </div>
          <button
            onClick={() => setIsExpanded(true)}
            className="px-4 py-2 bg-brand-primary text-white rounded-md hover:bg-brand-secondary text-sm"
          >
            {configuredProviders.length > 0 ? 'Manage' : 'Configure AI'}
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow p-6">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-lg font-semibold text-gray-900">AI Configuration</h3>
        <button
          onClick={() => setIsExpanded(false)}
          className="text-gray-400 hover:text-gray-600"
        >
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>

      {configuredProviders.length > 0 && (
        <div className="mb-6">
          <h4 className="text-md font-medium text-gray-800 mb-3">Configured Providers</h4>
          <div className="space-y-2">
            {configuredProviders.map((provider) => (
              <div key={provider} className="flex items-center justify-between p-3 bg-gray-50 rounded-md">
                <span className="text-sm font-medium">{provider}</span>
                <button
                  onClick={() => {
                    const [providerName, modelName] = provider.split('-') as [AIProvider, AIModel];
                    handleSetDefault(providerName, modelName);
                  }}
                  className="text-xs px-3 py-1 bg-brand-primary text-white rounded hover:bg-brand-secondary"
                >
                  Set Default
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      <div className="border-t pt-6">
        <h4 className="text-md font-medium text-gray-800 mb-4">Add New Provider</h4>
        
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Provider</label>
              <select
                value={newConfig.provider}
                onChange={(e) => {
                  const provider = e.target.value as AIProvider;
                  setNewConfig(prev => ({
                    ...prev,
                    provider,
                    model: providerModels[provider][0],
                  }));
                }}
                className="w-full rounded-md border-gray-300 shadow-sm focus:border-brand-primary focus:ring-brand-primary"
              >
                <option value="openai">OpenAI</option>
                <option value="anthropic">Anthropic</option>
              </select>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Model</label>
              <select
                value={newConfig.model}
                onChange={(e) => setNewConfig(prev => ({ ...prev, model: e.target.value as AIModel }))}
                className="w-full rounded-md border-gray-300 shadow-sm focus:border-brand-primary focus:ring-brand-primary"
              >
                {newConfig.provider && providerModels[newConfig.provider].map(model => (
                  <option key={model} value={model}>{model}</option>
                ))}
              </select>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">API Key</label>
            <input
              type="password"
              value={newConfig.apiKey || ''}
              onChange={(e) => setNewConfig(prev => ({ ...prev, apiKey: e.target.value }))}
              className="w-full rounded-md border-gray-300 shadow-sm focus:border-brand-primary focus:ring-brand-primary"
              placeholder="Enter your API key"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Temperature</label>
              <input
                type="number"
                min="0"
                max="2"
                step="0.1"
                value={newConfig.temperature}
                onChange={(e) => setNewConfig(prev => ({ ...prev, temperature: parseFloat(e.target.value) }))}
                className="w-full rounded-md border-gray-300 shadow-sm focus:border-brand-primary focus:ring-brand-primary"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Max Tokens</label>
              <input
                type="number"
                min="100"
                max="8000"
                step="100"
                value={newConfig.maxTokens}
                onChange={(e) => setNewConfig(prev => ({ ...prev, maxTokens: parseInt(e.target.value) }))}
                className="w-full rounded-md border-gray-300 shadow-sm focus:border-brand-primary focus:ring-brand-primary"
              />
            </div>
          </div>

          <button
            onClick={handleAddConfig}
            disabled={isConfiguring || !newConfig.apiKey}
            className="w-full px-4 py-2 bg-brand-primary text-white rounded-md hover:bg-brand-secondary disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isConfiguring ? 'Configuring...' : 'Add Provider'}
          </button>
        </div>
      </div>

      <div className="mt-6 p-4 bg-blue-50 rounded-md">
        <h5 className="text-sm font-medium text-blue-800 mb-2">Setup Instructions</h5>
        <ul className="text-xs text-blue-700 space-y-1">
          <li>• OpenAI: Get your API key from platform.openai.com</li>
          <li>• Anthropic: Get your API key from console.anthropic.com</li>
          <li>• Configure at least one provider to enable AI content generation</li>
          <li>• Multiple providers allow for model comparison and fallbacks</li>
        </ul>
      </div>
    </div>
  );
};