import React, { useState, useEffect } from 'react';
import { useSlottedContext } from '../../contexts/SlottedContext';

interface GoogleConfigPanelProps {
  onConfigured?: () => void;
}

export const GoogleConfigPanel: React.FC<GoogleConfigPanelProps> = ({ onConfigured }) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const [isConfigured, setIsConfigured] = useState(false);
  const [isConfiguring, setIsConfiguring] = useState(false);
  const [isTesting, setIsTesting] = useState(false);
  const [credentialsInput, setCredentialsInput] = useState('');
  const [testResults, setTestResults] = useState<{ sheets?: boolean; drive?: boolean } | null>(null);
  const { context } = useSlottedContext();

  useEffect(() => {
    // Simulate configuration check
    const stored = localStorage.getItem('google_workspace_configured');
    setIsConfigured(stored === 'true');
  }, []);

  const handleConfigureGoogle = async () => {
    if (!credentialsInput.trim()) {
      alert('Please paste your Google service account credentials JSON');
      return;
    }

    setIsConfiguring(true);
    try {
      const credentials = JSON.parse(credentialsInput);
      
      // Validate required fields
      const requiredFields = ['type', 'project_id', 'private_key', 'client_email'];
      for (const field of requiredFields) {
        if (!credentials[field]) {
          throw new Error(`Missing required field: ${field}`);
        }
      }

      // Store configuration (in production, send to backend)
      localStorage.setItem('google_workspace_configured', 'true');
      localStorage.setItem('google_credentials_email', credentials.client_email);
      localStorage.setItem('google_credentials', credentialsInput);
      
      setIsConfigured(true);
      setCredentialsInput(''); // Clear for security
      onConfigured?.();
      
      alert('Google Workspace configured successfully! (Note: Full integration requires backend)');
    } catch (error) {
      console.error('Failed to configure Google Workspace:', error);
      if (error instanceof SyntaxError) {
        alert('Invalid JSON format. Please check your credentials and try again.');
      } else {
        alert(`Configuration failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
      }
    } finally {
      setIsConfiguring(false);
    }
  };

  const handleTestConnection = async () => {
    setIsTesting(true);
    setTestResults(null);
    
    try {
      const credentials = localStorage.getItem('google_credentials');
      if (!credentials) {
        throw new Error('No credentials found. Please configure Google Workspace first.');
      }

      const response = await fetch(`${process.env.REACT_APP_BACKEND_URL || 'http://localhost:3001'}/api/google/test-connection`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ credentials }),
      });

      if (!response.ok) {
        throw new Error('Connection test failed');
      }

      const results = await response.json();
      setTestResults(results);
      alert('Connection test successful! Google Workspace is properly configured.');
    } catch (error) {
      console.error('Connection test failed:', error);
      alert(`Connection test failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    } finally {
      setIsTesting(false);
    }
  };

  const handleCreateSampleAssets = async () => {
    if (!context) {
      alert('Please complete onboarding first');
      return;
    }

    setIsConfiguring(true);
    try {
      // Simulate asset creation
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      alert(`Sample assets would be created for ${context.company.name}!\n\nNote: Full integration requires backend API.\n\nWould create:\n- Campaign calendar spreadsheet\n- Google Drive folder structure\n- 13-week content calendar`);
    } catch (error) {
      console.error('Failed to create sample assets:', error);
      alert('Failed to create sample assets. Please check your configuration.');
    } finally {
      setIsConfiguring(false);
    }
  };

  if (!isExpanded) {
    return (
      <div className="bg-white rounded-lg shadow p-4">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-lg font-semibold text-gray-900">Google Workspace</h3>
            <p className="text-sm text-gray-600">
              {isConfigured ? 'Connected' : 'Not configured'}
            </p>
          </div>
          <button
            onClick={() => setIsExpanded(true)}
            className="px-4 py-2 bg-brand-primary text-white rounded-md hover:bg-brand-secondary text-sm"
          >
            {isConfigured ? 'Manage' : 'Configure'}
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow p-6">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-lg font-semibold text-gray-900">Google Workspace Configuration</h3>
        <button
          onClick={() => setIsExpanded(false)}
          className="text-gray-400 hover:text-gray-600"
        >
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>

      {isConfigured ? (
        <div className="space-y-4">
          <div className="flex items-center space-x-2">
            <div className="w-3 h-3 bg-green-500 rounded-full"></div>
            <span className="text-sm font-medium text-green-700">Google Workspace Connected</span>
          </div>
          
          {testResults && (
            <div className="p-3 bg-gray-50 rounded-md">
              <h5 className="text-sm font-medium text-gray-800 mb-2">Last Test Results</h5>
              <div className="space-y-1 text-xs">
                <div className="flex items-center space-x-2">
                  <span className={`w-2 h-2 rounded-full ${testResults.sheets ? 'bg-green-500' : 'bg-red-500'}`}></span>
                  <span>Google Sheets API: {testResults.sheets ? 'Working' : 'Failed'}</span>
                </div>
                <div className="flex items-center space-x-2">
                  <span className={`w-2 h-2 rounded-full ${testResults.drive ? 'bg-green-500' : 'bg-red-500'}`}></span>
                  <span>Google Drive API: {testResults.drive ? 'Working' : 'Failed'}</span>
                </div>
              </div>
            </div>
          )}

          <div className="flex space-x-3">
            <button
              onClick={handleTestConnection}
              disabled={isTesting}
              className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50 text-sm"
            >
              {isTesting ? 'Testing...' : 'Test Connection'}
            </button>
            
            <button
              onClick={handleCreateSampleAssets}
              disabled={isConfiguring || !context}
              className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 disabled:opacity-50 text-sm"
            >
              {isConfiguring ? 'Creating...' : 'Create Sample Assets'}
            </button>
          </div>
        </div>
      ) : (
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Service Account Credentials (JSON)
            </label>
            <textarea
              rows={8}
              value={credentialsInput}
              onChange={(e) => setCredentialsInput(e.target.value)}
              className="w-full rounded-md border-gray-300 shadow-sm focus:border-brand-primary focus:ring-brand-primary font-mono text-xs"
              placeholder="Paste your Google service account JSON credentials here..."
            />
          </div>

          <button
            onClick={handleConfigureGoogle}
            disabled={isConfiguring || !credentialsInput.trim()}
            className="w-full px-4 py-2 bg-brand-primary text-white rounded-md hover:bg-brand-secondary disabled:opacity-50"
          >
            {isConfiguring ? 'Configuring...' : 'Configure Google Workspace'}
          </button>
        </div>
      )}

      <div className="mt-6 p-4 bg-yellow-50 rounded-md">
        <h5 className="text-sm font-medium text-yellow-800 mb-2">Setup Instructions</h5>
        <ol className="text-xs text-yellow-700 space-y-1 list-decimal list-inside">
          <li>Go to Google Cloud Console (console.cloud.google.com)</li>
          <li>Create a new project or select an existing one</li>
          <li>Enable Google Sheets API and Google Drive API</li>
          <li>Create a service account under IAM & Admin</li>
          <li>Download the JSON key file</li>
          <li>Copy and paste the JSON content above</li>
          <li>Share your Google Sheets/Drive with the service account email</li>
        </ol>
      </div>
    </div>
  );
};