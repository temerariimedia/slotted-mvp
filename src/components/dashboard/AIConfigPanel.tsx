import type React from 'react'
import { useEffect, useState } from 'react'
import {
  type AIConfig,
  type AIModel,
  type AIProvider,
  aiOrchestrator,
} from '../../services/ai/aiOrchestrator'

interface AIConfigPanelProps {
  onConfigured?: () => void
}

export const AIConfigPanel: React.FC<AIConfigPanelProps> = ({ onConfigured }) => {
  const [isExpanded, setIsExpanded] = useState(false)
  // const [configs, setConfigs] = useState<AIConfig[]>([]);
  const [newConfig, setNewConfig] = useState<Partial<AIConfig>>({
    provider: 'openai',
    model: 'gpt-4o',
    temperature: 0.7,
    maxTokens: 4000,
  })
  const [isConfiguring, setIsConfiguring] = useState(false)
  const [configuredProviders, setConfiguredProviders] = useState<string[]>([])

  useEffect(() => {
    setConfiguredProviders(aiOrchestrator.getConfiguredProviders())
  }, [])

  const providerModels: Record<AIProvider, AIModel[]> = {
    openai: ['gpt-4o', 'gpt-4'],
    anthropic: ['claude-3-5-sonnet', 'claude-3-haiku'],
  }

  const handleAddConfig = async () => {
    if (!newConfig.provider || !newConfig.model || !newConfig.apiKey) {
      alert('Please fill in all required fields')
      return
    }

    setIsConfiguring(true)
    try {
      aiOrchestrator.configureProvider(newConfig as AIConfig)

      // setConfigs(prev => [...prev, newConfig as AIConfig]);
      setConfiguredProviders(aiOrchestrator.getConfiguredProviders())

      setNewConfig({
        provider: 'openai',
        model: 'gpt-4o',
        temperature: 0.7,
        maxTokens: 4000,
        apiKey: '',
      })

      onConfigured?.()
      alert('AI provider configured successfully!')
    } catch (error) {
      console.error('Failed to configure AI provider:', error)
      alert('Failed to configure AI provider. Please check your settings.')
    } finally {
      setIsConfiguring(false)
    }
  }

  const handleSetDefault = (provider: AIProvider, model: AIModel) => {
    aiOrchestrator.setDefaultProvider(provider, model)
    alert(`Set ${provider} ${model} as default`)
  }

  if (!isExpanded) {
    return (
      <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-xl border border-white/30 p-6 hover:shadow-2xl transition-all duration-300">
        <div className="flex items-center justify-between">
          <div className="flex items-start space-x-4">
            <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-purple-600 rounded-xl flex items-center justify-center flex-shrink-0">
              <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
              </svg>
            </div>
            <div>
              <h3 className="text-xl font-bold text-slate-900 mb-1">AI Configuration</h3>
              <p className="text-sm text-slate-600">
                {configuredProviders.length > 0
                  ? `${configuredProviders.length} AI provider(s) ready for content generation`
                  : 'Set up your AI providers to start creating content'}
              </p>
              {configuredProviders.length > 0 && (
                <div className="flex items-center mt-2">
                  <div className="w-2 h-2 bg-emerald-500 rounded-full mr-2"></div>
                  <span className="text-xs text-emerald-600 font-medium">Active & Ready</span>
                </div>
              )}
            </div>
          </div>
          <button
            onClick={() => setIsExpanded(true)}
            className="group inline-flex items-center px-6 py-3 bg-gradient-to-r from-purple-600 to-purple-700 text-white rounded-xl hover:from-purple-700 hover:to-purple-800 transform hover:scale-105 transition-all duration-200 shadow-lg hover:shadow-xl touch-manipulation"
          >
            {configuredProviders.length > 0 ? 'Manage Providers' : 'Setup AI'}
            <svg className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform duration-200" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="bg-white/90 backdrop-blur-sm rounded-2xl shadow-2xl border border-white/40 p-8 animate-fadeIn">
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center space-x-4">
          <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-purple-600 rounded-xl flex items-center justify-center">
            <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
            </svg>
          </div>
          <div>
            <h3 className="text-2xl font-bold text-slate-900">AI Configuration</h3>
            <p className="text-slate-600">Manage your AI providers and models</p>
          </div>
        </div>
        <button 
          onClick={() => setIsExpanded(false)} 
          className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-xl transition-all duration-200"
          aria-label="Close AI configuration"
        >
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>

      {configuredProviders.length > 0 && (
        <div className="mb-8">
          <div className="flex items-center space-x-3 mb-4">
            <div className="w-2 h-2 bg-emerald-500 rounded-full"></div>
            <h4 className="text-lg font-semibold text-slate-800">Active AI Providers</h4>
          </div>
          <div className="grid gap-3">
            {configuredProviders.map((provider) => (
              <div
                key={provider}
                className="group flex items-center justify-between p-4 bg-gradient-to-r from-slate-50 to-slate-100 border border-slate-200 rounded-xl hover:shadow-md transition-all duration-200"
              >
                <div className="flex items-center space-x-3">
                  <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-blue-600 rounded-lg flex items-center justify-center">
                    <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M11.3 1.046A1 1 0 0112 2v5h4a1 1 0 01.82 1.573l-7 10A1 1 0 018 18v-5H4a1 1 0 01-.82-1.573l7-10a1 1 0 011.12-.38z" clipRule="evenodd" />
                    </svg>
                  </div>
                  <div>
                    <span className="font-semibold text-slate-900 capitalize">{provider.replace('-', ' ')}</span>
                    <p className="text-xs text-slate-500">Ready for content generation</p>
                  </div>
                </div>
                <button
                  onClick={() => {
                    const [providerName, modelName] = provider.split('-') as [AIProvider, AIModel]
                    handleSetDefault(providerName, modelName)
                  }}
                  className="px-4 py-2 bg-gradient-to-r from-blue-600 to-blue-700 text-white text-sm rounded-lg hover:from-blue-700 hover:to-blue-800 transform group-hover:scale-105 transition-all duration-200 shadow-sm hover:shadow-md"
                >
                  Set as Default
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      <div className="border-t border-slate-200 pt-8">
        <div className="flex items-center space-x-3 mb-6">
          <div className="w-8 h-8 bg-gradient-to-br from-emerald-500 to-emerald-600 rounded-lg flex items-center justify-center">
            <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
            </svg>
          </div>
          <h4 className="text-lg font-semibold text-slate-800">Add New AI Provider</h4>
        </div>

        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">AI Provider *</label>
              <select
                value={newConfig.provider}
                onChange={(e) => {
                  const provider = e.target.value as AIProvider
                  setNewConfig((prev) => ({
                    ...prev,
                    provider,
                    model: providerModels[provider][0],
                  }))
                }}
                className="w-full border-2 border-slate-300 px-4 py-3 text-base rounded-xl focus:outline-none focus:border-blue-600 focus:ring-4 focus:ring-blue-600/10 transition-all duration-200 bg-white"
                required
              >
                <option value="openai">OpenAI (GPT Models)</option>
                <option value="anthropic">Anthropic (Claude Models)</option>
              </select>
              <p className="text-sm text-slate-500 mt-1">Choose your preferred AI provider</p>
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">AI Model *</label>
              <select
                value={newConfig.model}
                onChange={(e) =>
                  setNewConfig((prev) => ({ ...prev, model: e.target.value as AIModel }))
                }
                className="w-full border-2 border-slate-300 px-4 py-3 text-base rounded-xl focus:outline-none focus:border-blue-600 focus:ring-4 focus:ring-blue-600/10 transition-all duration-200 bg-white"
                required
              >
                {newConfig.provider &&
                  providerModels[newConfig.provider].map((model) => (
                    <option key={model} value={model}>
                      {model.toUpperCase()}
                    </option>
                  ))}
              </select>
              <p className="text-sm text-slate-500 mt-1">Select the specific model to use</p>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">API Key *</label>
            <input
              type="password"
              value={newConfig.apiKey || ''}
              onChange={(e) => setNewConfig((prev) => ({ ...prev, apiKey: e.target.value }))}
              className="w-full border-2 border-slate-300 px-4 py-3 text-base rounded-xl focus:outline-none focus:border-blue-600 focus:ring-4 focus:ring-blue-600/10 transition-all duration-200"
              placeholder="sk-... or claude-... (your API key)"
              required
              aria-describedby="api-key-help"
            />
            <p id="api-key-help" className="text-sm text-slate-500 mt-1">Your API key is stored securely and never shared</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">Temperature</label>
              <input
                type="number"
                min="0"
                max="2"
                step="0.1"
                value={newConfig.temperature}
                onChange={(e) =>
                  setNewConfig((prev) => ({
                    ...prev,
                    temperature: Number.parseFloat(e.target.value),
                  }))
                }
                className="w-full border-2 border-slate-300 px-4 py-3 text-base rounded-xl focus:outline-none focus:border-blue-600 focus:ring-4 focus:ring-blue-600/10 transition-all duration-200"
                aria-describedby="temperature-help"
              />
              <p id="temperature-help" className="text-sm text-slate-500 mt-1">0.1 = Focused, 1.0 = Creative</p>
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">Max Tokens</label>
              <input
                type="number"
                min="100"
                max="8000"
                step="100"
                value={newConfig.maxTokens}
                onChange={(e) =>
                  setNewConfig((prev) => ({ ...prev, maxTokens: Number.parseInt(e.target.value) }))
                }
                className="w-full border-2 border-slate-300 px-4 py-3 text-base rounded-xl focus:outline-none focus:border-blue-600 focus:ring-4 focus:ring-blue-600/10 transition-all duration-200"
                aria-describedby="tokens-help"
              />
              <p id="tokens-help" className="text-sm text-slate-500 mt-1">Maximum response length</p>
            </div>
          </div>

          <button
            onClick={handleAddConfig}
            disabled={isConfiguring || !newConfig.apiKey}
            className="w-full group inline-flex items-center justify-center px-8 py-4 bg-gradient-to-r from-emerald-600 to-emerald-700 text-white text-lg font-semibold rounded-xl hover:from-emerald-700 hover:to-emerald-800 disabled:opacity-50 disabled:cursor-not-allowed transform hover:scale-105 transition-all duration-200 shadow-lg hover:shadow-xl touch-manipulation"
          >
            {isConfiguring ? (
              <>
                <div className="w-5 h-5 mr-3 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                Configuring Provider...
              </>
            ) : (
              <>
                Add AI Provider
                <svg className="w-5 h-5 ml-2 group-hover:translate-x-1 transition-transform duration-200" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                </svg>
              </>
            )}
          </button>
        </div>
      </div>

      <div className="mt-8 p-6 bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 rounded-2xl">
        <div className="flex items-start space-x-3">
          <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-blue-600 rounded-lg flex items-center justify-center flex-shrink-0 mt-0.5">
            <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <div>
            <h5 className="text-base font-semibold text-blue-900 mb-3">Setup Instructions</h5>
            <div className="space-y-3 text-sm text-blue-800">
              <div className="flex items-start space-x-2">
                <div className="w-1.5 h-1.5 bg-blue-600 rounded-full mt-2 flex-shrink-0"></div>
                <p><strong>OpenAI:</strong> Get your API key from <span className="font-mono bg-blue-100 px-1 rounded">platform.openai.com</span></p>
              </div>
              <div className="flex items-start space-x-2">
                <div className="w-1.5 h-1.5 bg-blue-600 rounded-full mt-2 flex-shrink-0"></div>
                <p><strong>Anthropic:</strong> Get your API key from <span className="font-mono bg-blue-100 px-1 rounded">console.anthropic.com</span></p>
              </div>
              <div className="flex items-start space-x-2">
                <div className="w-1.5 h-1.5 bg-blue-600 rounded-full mt-2 flex-shrink-0"></div>
                <p>Configure at least one provider to enable AI content generation</p>
              </div>
              <div className="flex items-start space-x-2">
                <div className="w-1.5 h-1.5 bg-blue-600 rounded-full mt-2 flex-shrink-0"></div>
                <p>Multiple providers allow for model comparison and automatic fallbacks</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
