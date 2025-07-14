import React, { useState } from 'react';
import { SlottedContext } from '../../schemas/slottedContext';
import { mcpContextEngine } from '../../services/mcp/contextEngine';
import { useSlottedContext } from '../../contexts/SlottedContext';

interface OnboardingFormProps {
  onComplete: (context: SlottedContext) => void;
}

export const OnboardingForm: React.FC<OnboardingFormProps> = ({ onComplete }) => {
  const [currentStep, setCurrentStep] = useState(0);
  const [formData, setFormData] = useState<Partial<SlottedContext>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { saveContext } = useSlottedContext();

  const steps = [
    'Company Basics',
    'Company Details', 
    'Brand Identity',
    'Value Propositions',
    'Target Audience',
    'Pain Points',
    'Marketing Strategy',
    'Content Preferences',
    'AI Persona Setup'
  ];

  const handleInputChange = (path: string, value: any) => {
    setFormData(prev => {
      const newData = { ...prev };
      const keys = path.split('.');
      let current: any = newData;
      
      for (let i = 0; i < keys.length - 1; i++) {
        if (!current[keys[i]]) {
          current[keys[i]] = {};
        }
        current = current[keys[i]];
      }
      
      current[keys[keys.length - 1]] = value;
      return newData;
    });
  };

  const handleArrayInputChange = (path: string, value: string) => {
    const items = value.split(',').map(item => item.trim()).filter(item => item);
    handleInputChange(path, items);
  };

  const nextStep = () => {
    if (currentStep < steps.length - 1) {
      setCurrentStep(currentStep + 1);
    }
  };

  const prevStep = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleSubmit = async () => {
    setIsSubmitting(true);
    try {
      const completeContext = mcpContextEngine.createInitialContext(formData);
      await saveContext(completeContext);
      onComplete(completeContext);
    } catch (error) {
      console.error('Failed to save onboarding data:', error);
      alert('Failed to save onboarding data. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const renderStep = () => {
    switch (currentStep) {
      case 0: // Company Basics
        return (
          <div>
            <h2 className="text-lg font-medium text-black mb-6">Company Basics</h2>
            <div className="space-y-4">
              <div>
                <label className="block text-sm text-gray-700 mb-1">Company Name</label>
                <input
                  type="text"
                  className="w-full border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:border-black"
                  value={formData.company?.name || ''}
                  onChange={(e) => handleInputChange('company.name', e.target.value)}
                  placeholder="Company name"
                />
              </div>
              <div>
                <label className="block text-sm text-gray-700 mb-1">Industry</label>
                <input
                  type="text"
                  className="w-full border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:border-black"
                  value={formData.company?.industry || ''}
                  onChange={(e) => handleInputChange('company.industry', e.target.value)}
                  placeholder="e.g., SaaS, E-commerce"
                />
              </div>
              <div>
                <label className="block text-sm text-gray-700 mb-1">Company Size</label>
                <select
                  className="w-full border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:border-black"
                  value={formData.company?.size || ''}
                  onChange={(e) => handleInputChange('company.size', e.target.value)}
                >
                  <option value="">Select size</option>
                  <option value="startup">Startup (1-10)</option>
                  <option value="small">Small (11-50)</option>
                  <option value="medium">Medium (51-200)</option>
                  <option value="enterprise">Enterprise (200+)</option>
                </select>
              </div>
            </div>
          </div>
        );

      case 1: // Company Details
        return (
          <div>
            <h2 className="text-lg font-medium text-black mb-6">Company Details</h2>
            <div className="space-y-4">
              <div>
                <label className="block text-sm text-gray-700 mb-1">Description</label>
                <textarea
                  rows={3}
                  className="w-full border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:border-black"
                  value={formData.company?.description || ''}
                  onChange={(e) => handleInputChange('company.description', e.target.value)}
                  placeholder="What does your company do?"
                />
              </div>
              <div>
                <label className="block text-sm text-gray-700 mb-1">Website</label>
                <input
                  type="url"
                  className="w-full border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:border-black"
                  value={formData.company?.website || ''}
                  onChange={(e) => handleInputChange('company.website', e.target.value)}
                  placeholder="https://company.com"
                />
              </div>
            </div>
          </div>
        );

      case 2: // Brand Identity
        return (
          <div>
            <h2 className="text-lg font-medium text-black mb-6">Brand Identity</h2>
            <div className="space-y-4">
              <div>
                <label className="block text-sm text-gray-700 mb-2">Brand Colors</label>
                <div className="grid grid-cols-3 gap-3">
                  <div>
                    <label className="block text-xs text-gray-600 mb-1">Primary</label>
                    <input
                      type="color"
                      className="w-full h-8 border border-gray-300"
                      value={formData.brandDNA?.brandColors?.primary || '#2563eb'}
                      onChange={(e) => handleInputChange('brandDNA.brandColors.primary', e.target.value)}
                    />
                  </div>
                  <div>
                    <label className="block text-xs text-gray-600 mb-1">Secondary</label>
                    <input
                      type="color"
                      className="w-full h-8 border border-gray-300"
                      value={formData.brandDNA?.brandColors?.secondary || '#3b82f6'}
                      onChange={(e) => handleInputChange('brandDNA.brandColors.secondary', e.target.value)}
                    />
                  </div>
                  <div>
                    <label className="block text-xs text-gray-600 mb-1">Accent</label>
                    <input
                      type="color"
                      className="w-full h-8 border border-gray-300"
                      value={formData.brandDNA?.brandColors?.accent || '#10b981'}
                      onChange={(e) => handleInputChange('brandDNA.brandColors.accent', e.target.value)}
                    />
                  </div>
                </div>
              </div>
              <div>
                <label className="block text-sm text-gray-700 mb-1">Brand Personality</label>
                <input
                  type="text"
                  className="w-full border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:border-black"
                  value={formData.brandDNA?.brandTone?.personality?.join(', ') || ''}
                  onChange={(e) => handleArrayInputChange('brandDNA.brandTone.personality', e.target.value)}
                  placeholder="Professional, innovative, trustworthy"
                />
              </div>
              <div>
                <label className="block text-sm text-gray-700 mb-1">Communication Style</label>
                <select
                  className="w-full border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:border-black"
                  value={formData.brandDNA?.brandTone?.communicationStyle || ''}
                  onChange={(e) => handleInputChange('brandDNA.brandTone.communicationStyle', e.target.value)}
                >
                  <option value="">Select style</option>
                  <option value="formal">Formal</option>
                  <option value="conversational">Conversational</option>
                  <option value="casual">Casual</option>
                  <option value="technical">Technical</option>
                </select>
              </div>
            </div>
          </div>
        );

      case 3: // Value Propositions
        return (
          <div className="space-y-6">
            <div className="text-center mb-8">
              <h2 className="text-3xl font-bold text-gray-900">What Makes You Special?</h2>
              <p className="text-gray-600 mt-2">Your unique value propositions and core offerings</p>
            </div>
            <div className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Value Propositions *</label>
                <textarea
                  rows={4}
                  className="block w-full rounded-lg border-gray-300 shadow-sm focus:border-brand-primary focus:ring-brand-primary text-lg py-3"
                  value={formData.brandDNA?.valuePropositions?.join(', ') || ''}
                  onChange={(e) => handleArrayInputChange('brandDNA.valuePropositions', e.target.value)}
                  placeholder="What unique value do you provide? What problems do you solve? (separate multiple values with commas)"
                />
                <p className="text-sm text-gray-500 mt-1">Examples: "Increase sales by 50%", "Reduce costs by 30%", "Save 10 hours per week"</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Core Products/Services *</label>
                <textarea
                  rows={4}
                  className="block w-full rounded-lg border-gray-300 shadow-sm focus:border-brand-primary focus:ring-brand-primary text-lg py-3"
                  value={formData.brandDNA?.coreOfferings?.join(', ') || ''}
                  onChange={(e) => handleArrayInputChange('brandDNA.coreOfferings', e.target.value)}
                  placeholder="Your main products or services (separate with commas)"
                />
                <p className="text-sm text-gray-500 mt-1">Examples: "Marketing automation software", "Business consulting", "Web development"</p>
              </div>
            </div>
          </div>
        );

      case 4: // Target Audience
        return (
          <div className="space-y-6">
            <div className="text-center mb-8">
              <h2 className="text-3xl font-bold text-gray-900">Who Are Your Ideal Customers?</h2>
              <p className="text-gray-600 mt-2">Define your target audience demographics and characteristics</p>
            </div>
            <div className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Demographics *</label>
                <textarea
                  rows={4}
                  className="block w-full rounded-lg border-gray-300 shadow-sm focus:border-brand-primary focus:ring-brand-primary text-lg py-3"
                  value={formData.brandDNA?.targetAudience?.demographics || ''}
                  onChange={(e) => handleInputChange('brandDNA.targetAudience.demographics', e.target.value)}
                  placeholder="Age range, location, job titles, income level, company size, industry..."
                />
                <p className="text-sm text-gray-500 mt-1">Examples: "CEOs of 50-500 person companies", "Marketing managers aged 25-45", "Small business owners"</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Psychographics</label>
                <textarea
                  rows={4}
                  className="block w-full rounded-lg border-gray-300 shadow-sm focus:border-brand-primary focus:ring-brand-primary text-lg py-3"
                  value={formData.brandDNA?.targetAudience?.psychographics || ''}
                  onChange={(e) => handleInputChange('brandDNA.targetAudience.psychographics', e.target.value)}
                  placeholder="Values, interests, behaviors, lifestyle, goals, motivations..."
                />
                <p className="text-sm text-gray-500 mt-1">Examples: "Values efficiency and ROI", "Early technology adopters", "Growth-focused mindset"</p>
              </div>
            </div>
          </div>
        );

      case 5: // Pain Points
        return (
          <div className="space-y-6">
            <div className="text-center mb-8">
              <h2 className="text-3xl font-bold text-gray-900">What Problems Do They Face?</h2>
              <p className="text-gray-600 mt-2">Identify the key challenges your audience experiences</p>
            </div>
            <div className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Primary Pain Points *</label>
                <textarea
                  rows={5}
                  className="block w-full rounded-lg border-gray-300 shadow-sm focus:border-brand-primary focus:ring-brand-primary text-lg py-3"
                  value={formData.brandDNA?.targetAudience?.painPoints?.join(', ') || ''}
                  onChange={(e) => handleArrayInputChange('brandDNA.targetAudience.painPoints', e.target.value)}
                  placeholder="What specific problems, challenges, or frustrations do they face? (separate with commas)"
                />
                <p className="text-sm text-gray-500 mt-1">Examples: "Too much manual work", "Lack of visibility into performance", "Difficulty scaling operations"</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">How Do These Problems Impact Them?</label>
                <textarea
                  rows={3}
                  className="block w-full rounded-lg border-gray-300 shadow-sm focus:border-brand-primary focus:ring-brand-primary text-lg py-3"
                  value={formData.brandDNA?.targetAudience?.impact || ''}
                  onChange={(e) => handleInputChange('brandDNA.targetAudience.impact', e.target.value)}
                  placeholder="Lost revenue, wasted time, increased stress, missed opportunities..."
                />
              </div>
            </div>
          </div>
        );

      case 6: // Marketing Strategy
        return (
          <div className="space-y-6">
            <div className="text-center mb-8">
              <h2 className="text-3xl font-bold text-gray-900">Your Marketing Strategy</h2>
              <p className="text-gray-600 mt-2">Goals, channels, and content approach</p>
            </div>
            <div className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Primary Marketing Goals *</label>
                <textarea
                  rows={3}
                  className="block w-full rounded-lg border-gray-300 shadow-sm focus:border-brand-primary focus:ring-brand-primary text-lg py-3"
                  value={formData.marketingGoals?.primaryGoals?.join(', ') || ''}
                  onChange={(e) => handleArrayInputChange('marketingGoals.primaryGoals', e.target.value)}
                  placeholder="Brand awareness, lead generation, customer acquisition, thought leadership, etc. (separate with commas)"
                />
              </div>
              <div className="grid grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Content Frequency *</label>
                  <select
                    className="block w-full rounded-lg border-gray-300 shadow-sm focus:border-brand-primary focus:ring-brand-primary text-lg py-3"
                    value={formData.marketingGoals?.cadence || ''}
                    onChange={(e) => handleInputChange('marketingGoals.cadence', e.target.value)}
                  >
                    <option value="">Select frequency</option>
                    <option value="daily">Daily</option>
                    <option value="weekly">Weekly</option>
                    <option value="bi-weekly">Bi-weekly</option>
                    <option value="monthly">Monthly</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Budget Range (Optional)</label>
                  <select
                    className="block w-full rounded-lg border-gray-300 shadow-sm focus:border-brand-primary focus:ring-brand-primary text-lg py-3"
                    value={formData.marketingGoals?.budget || ''}
                    onChange={(e) => handleInputChange('marketingGoals.budget', e.target.value)}
                  >
                    <option value="">Select budget</option>
                    <option value="under-5k">Under $5,000/month</option>
                    <option value="5k-15k">$5,000 - $15,000/month</option>
                    <option value="15k-50k">$15,000 - $50,000/month</option>
                    <option value="over-50k">Over $50,000/month</option>
                  </select>
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Primary Marketing Channels *</label>
                <textarea
                  rows={3}
                  className="block w-full rounded-lg border-gray-300 shadow-sm focus:border-brand-primary focus:ring-brand-primary text-lg py-3"
                  value={formData.marketingGoals?.channels?.primary?.join(', ') || ''}
                  onChange={(e) => handleArrayInputChange('marketingGoals.channels.primary', e.target.value)}
                  placeholder="Blog, LinkedIn, Email marketing, Google Ads, etc. (separate with commas)"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Secondary/Experimental Channels</label>
                <textarea
                  rows={3}
                  className="block w-full rounded-lg border-gray-300 shadow-sm focus:border-brand-primary focus:ring-brand-primary text-lg py-3"
                  value={formData.marketingGoals?.channels?.secondary?.join(', ') || ''}
                  onChange={(e) => handleArrayInputChange('marketingGoals.channels.secondary', e.target.value)}
                  placeholder="Twitter, Instagram, YouTube, TikTok, podcasts, etc. (separate with commas)"
                />
              </div>
            </div>
          </div>
        );

      case 7: // Content Preferences
        return (
          <div className="space-y-6">
            <div className="text-center mb-8">
              <h2 className="text-3xl font-bold text-gray-900">Content Preferences</h2>
              <p className="text-gray-600 mt-2">What types of content work best for you?</p>
            </div>
            <div className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Preferred Content Types *</label>
                <textarea
                  rows={3}
                  className="block w-full rounded-lg border-gray-300 shadow-sm focus:border-brand-primary focus:ring-brand-primary text-lg py-3"
                  value={formData.contentPreferences?.contentTypes?.join(', ') || ''}
                  onChange={(e) => handleArrayInputChange('contentPreferences.contentTypes', e.target.value)}
                  placeholder="Blog posts, videos, infographics, case studies, webinars, podcasts, etc. (separate with commas)"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-4">Content Length Preferences</label>
                <div className="grid grid-cols-3 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Blog Posts (words)</label>
                    <input
                      type="number"
                      className="block w-full rounded-lg border-gray-300 shadow-sm focus:border-brand-primary focus:ring-brand-primary text-lg py-3"
                      value={formData.contentPreferences?.lengthPreferences?.blog || 2000}
                      onChange={(e) => handleInputChange('contentPreferences.lengthPreferences.blog', parseInt(e.target.value))}
                      min="500"
                      max="5000"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Social Posts (characters)</label>
                    <input
                      type="number"
                      className="block w-full rounded-lg border-gray-300 shadow-sm focus:border-brand-primary focus:ring-brand-primary text-lg py-3"
                      value={formData.contentPreferences?.lengthPreferences?.social || 280}
                      onChange={(e) => handleInputChange('contentPreferences.lengthPreferences.social', parseInt(e.target.value))}
                      min="50"
                      max="500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Email Content (words)</label>
                    <input
                      type="number"
                      className="block w-full rounded-lg border-gray-300 shadow-sm focus:border-brand-primary focus:ring-brand-primary text-lg py-3"
                      value={formData.contentPreferences?.lengthPreferences?.email || 500}
                      onChange={(e) => handleInputChange('contentPreferences.lengthPreferences.email', parseInt(e.target.value))}
                      min="100"
                      max="1000"
                    />
                  </div>
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Content Style Guidelines</label>
                <textarea
                  rows={3}
                  className="block w-full rounded-lg border-gray-300 shadow-sm focus:border-brand-primary focus:ring-brand-primary text-lg py-3"
                  value={formData.contentPreferences?.styleGuidelines?.join(', ') || ''}
                  onChange={(e) => handleArrayInputChange('contentPreferences.styleGuidelines', e.target.value)}
                  placeholder="Data-driven, storytelling, educational, actionable, etc. (separate with commas)"
                />
              </div>
            </div>
          </div>
        );

      case 8: // AI Persona Setup
        return (
          <div className="space-y-6">
            <div className="text-center mb-8">
              <h2 className="text-3xl font-bold text-gray-900">AI Content Assistant Setup</h2>
              <p className="text-gray-600 mt-2">Configure your AI to match your brand voice and expertise</p>
            </div>
            <div className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">AI Personality Traits *</label>
                <textarea
                  rows={3}
                  className="block w-full rounded-lg border-gray-300 shadow-sm focus:border-brand-primary focus:ring-brand-primary text-lg py-3"
                  value={formData.aiPersona?.personalityTraits?.join(', ') || ''}
                  onChange={(e) => handleArrayInputChange('aiPersona.personalityTraits', e.target.value)}
                  placeholder="Professional, friendly, analytical, creative, authoritative, approachable, etc. (separate with commas)"
                />
                <p className="text-sm text-gray-500 mt-1">How should your AI assistant's personality come across in content?</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Communication Pattern *</label>
                <textarea
                  rows={3}
                  className="block w-full rounded-lg border-gray-300 shadow-sm focus:border-brand-primary focus:ring-brand-primary text-lg py-3"
                  value={formData.aiPersona?.communicationPattern || ''}
                  onChange={(e) => handleInputChange('aiPersona.communicationPattern', e.target.value)}
                  placeholder="Describe how the AI should communicate: formal tone with data backing, conversational with stories, direct and actionable, etc."
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Areas of Expertise</label>
                <textarea
                  rows={3}
                  className="block w-full rounded-lg border-gray-300 shadow-sm focus:border-brand-primary focus:ring-brand-primary text-lg py-3"
                  value={formData.aiPersona?.knowledgeAreas?.join(', ') || ''}
                  onChange={(e) => handleArrayInputChange('aiPersona.knowledgeAreas', e.target.value)}
                  placeholder="Industry knowledge, technical skills, business topics the AI should be expert in (separate with commas)"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Content Constraints & Guidelines</label>
                <textarea
                  rows={3}
                  className="block w-full rounded-lg border-gray-300 shadow-sm focus:border-brand-primary focus:ring-brand-primary text-lg py-3"
                  value={formData.aiPersona?.constraints?.join(', ') || ''}
                  onChange={(e) => handleArrayInputChange('aiPersona.constraints', e.target.value)}
                  placeholder="Things to avoid, topics to handle carefully, brand guidelines to follow (separate with commas)"
                />
              </div>
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-white">
      <div className="max-w-2xl mx-auto px-6 py-12">
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-black mb-2">Slotted</h1>
          <p className="text-gray-600 text-sm">Step {currentStep + 1} of {steps.length}</p>
          <div className="w-full bg-gray-200 h-1 mt-3">
            <div 
              className="bg-black h-1"
              style={{ width: `${((currentStep + 1) / steps.length) * 100}%` }}
            />
          </div>
        </div>

        <div>
          {renderStep()}

          <div className="flex justify-between mt-8">
            <button
              onClick={prevStep}
              disabled={currentStep === 0}
              className="px-4 py-2 text-sm border border-gray-300 bg-white hover:bg-gray-50 disabled:opacity-50"
            >
              Back
            </button>
            
            {currentStep === steps.length - 1 ? (
              <button
                onClick={handleSubmit}
                disabled={isSubmitting}
                className="px-4 py-2 text-sm bg-black text-white hover:bg-gray-800 disabled:opacity-50"
              >
                {isSubmitting ? 'Creating...' : 'Complete'}
              </button>
            ) : (
              <button
                onClick={nextStep}
                className="px-4 py-2 text-sm bg-black text-white hover:bg-gray-800"
              >
                Continue
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};