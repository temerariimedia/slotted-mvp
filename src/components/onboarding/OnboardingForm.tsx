import type React from 'react'
import { useState } from 'react'
import { useSlottedContext } from '../../contexts/SlottedContext'
import type { SlottedContext } from '../../schemas/slottedContext'
import { mcpContextEngine } from '../../services/mcp/contextEngine'

interface OnboardingFormProps {
  onComplete: (context: SlottedContext) => void
}

export const OnboardingForm: React.FC<OnboardingFormProps> = ({ onComplete }) => {
  const [currentStep, setCurrentStep] = useState(0)
  const [formData, setFormData] = useState<Partial<SlottedContext>>({})
  const [isSubmitting, setIsSubmitting] = useState(false)
  const { saveContext } = useSlottedContext()

  const steps = [
    'Company Basics',
    'Company Details',
    'Brand Identity',
    'Value Propositions',
    'Target Audience',
    'Pain Points',
    'Marketing Strategy',
    'Content Preferences',
    'AI Persona Setup',
  ]

  const handleInputChange = (path: string, value: any) => {
    setFormData((prev) => {
      const newData = { ...prev }
      const keys = path.split('.')
      let current: any = newData

      for (let i = 0; i < keys.length - 1; i++) {
        if (!current[keys[i]]) {
          current[keys[i]] = {}
        }
        current = current[keys[i]]
      }

      current[keys[keys.length - 1]] = value
      return newData
    })
  }

  const handleArrayInputChange = (path: string, value: string) => {
    const items = value
      .split(',')
      .map((item) => item.trim())
      .filter((item) => item)
    handleInputChange(path, items)
  }

  const nextStep = () => {
    if (currentStep < steps.length - 1) {
      setCurrentStep(currentStep + 1)
    }
  }

  const prevStep = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1)
    }
  }

  const handleSubmit = async () => {
    setIsSubmitting(true)
    try {
      const completeContext = mcpContextEngine.createInitialContext(formData)
      await saveContext(completeContext)
      onComplete(completeContext)
    } catch (error) {
      console.error('Failed to save onboarding data:', error)
      alert('Failed to save onboarding data. Please try again.')
    } finally {
      setIsSubmitting(false)
    }
  }

  const renderStep = () => {
    switch (currentStep) {
      case 0: // Company Basics
        return (
          <div>
            <div className="text-center mb-8">
              <h2 className="text-2xl font-bold text-slate-900 mb-2">Company Basics</h2>
              <p className="text-slate-600">Let's start with the essentials about your company</p>
            </div>
            <div className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">Company Name *</label>
                <input
                  type="text"
                  className="w-full border-2 border-slate-300 px-4 py-3 text-base rounded-xl focus:outline-none focus:border-blue-600 focus:ring-4 focus:ring-blue-600/10 transition-all duration-200"
                  value={formData.company?.name || ''}
                  onChange={(e) => handleInputChange('company.name', e.target.value)}
                  placeholder="Enter your company name"
                  required
                  aria-describedby="company-name-help"
                />
                <p id="company-name-help" className="text-sm text-slate-500 mt-1">The official name of your business</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">Industry *</label>
                <input
                  type="text"
                  className="w-full border-2 border-slate-300 px-4 py-3 text-base rounded-xl focus:outline-none focus:border-blue-600 focus:ring-4 focus:ring-blue-600/10 transition-all duration-200"
                  value={formData.company?.industry || ''}
                  onChange={(e) => handleInputChange('company.industry', e.target.value)}
                  placeholder="e.g., SaaS, E-commerce, Healthcare, Consulting"
                  required
                  aria-describedby="industry-help"
                />
                <p id="industry-help" className="text-sm text-slate-500 mt-1">What sector does your business operate in?</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">Company Size *</label>
                <select
                  className="w-full border-2 border-slate-300 px-4 py-3 text-base rounded-xl focus:outline-none focus:border-blue-600 focus:ring-4 focus:ring-blue-600/10 transition-all duration-200 bg-white"
                  value={formData.company?.size || ''}
                  onChange={(e) => handleInputChange('company.size', e.target.value)}
                  required
                  aria-describedby="size-help"
                >
                  <option value="">Select company size</option>
                  <option value="startup">Startup (1-10 employees)</option>
                  <option value="small">Small Business (11-50 employees)</option>
                  <option value="medium">Medium Business (51-200 employees)</option>
                  <option value="enterprise">Enterprise (200+ employees)</option>
                </select>
                <p id="size-help" className="text-sm text-slate-500 mt-1">This helps us tailor your marketing strategy</p>
              </div>
            </div>
          </div>
        )

      case 1: // Company Details
        return (
          <div>
            <div className="text-center mb-8">
              <h2 className="text-2xl font-bold text-slate-900 mb-2">Company Details</h2>
              <p className="text-slate-600">Tell us more about what your company does</p>
            </div>
            <div className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">Company Description *</label>
                <textarea
                  rows={4}
                  className="w-full border-2 border-slate-300 px-4 py-3 text-base rounded-xl focus:outline-none focus:border-blue-600 focus:ring-4 focus:ring-blue-600/10 transition-all duration-200 resize-none"
                  value={formData.company?.description || ''}
                  onChange={(e) => handleInputChange('company.description', e.target.value)}
                  placeholder="Describe what your company does, your mission, and what makes you unique..."
                  required
                  aria-describedby="description-help"
                />
                <p id="description-help" className="text-sm text-slate-500 mt-1">A clear description helps us create better marketing content</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">Website URL</label>
                <input
                  type="url"
                  className="w-full border-2 border-slate-300 px-4 py-3 text-base rounded-xl focus:outline-none focus:border-blue-600 focus:ring-4 focus:ring-blue-600/10 transition-all duration-200"
                  value={formData.company?.website || ''}
                  onChange={(e) => handleInputChange('company.website', e.target.value)}
                  placeholder="https://yourcompany.com"
                  aria-describedby="website-help"
                />
                <p id="website-help" className="text-sm text-slate-500 mt-1">We'll analyze your website to better understand your brand</p>
              </div>
            </div>
          </div>
        )

      case 2: // Brand Identity
        return (
          <div>
            <div className="text-center mb-8">
              <h2 className="text-2xl font-bold text-slate-900 mb-2">Brand Identity</h2>
              <p className="text-slate-600">Define your visual identity and brand personality</p>
            </div>
            <div className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-3">Brand Colors</label>
                <div className="grid grid-cols-3 gap-4">
                  <div className="space-y-2">
                    <label className="block text-sm font-medium text-slate-700">Primary Color</label>
                    <div className="flex items-center space-x-3">
                      <input
                        type="color"
                        className="w-12 h-12 border-2 border-slate-300 rounded-lg cursor-pointer hover:border-slate-400 transition-colors"
                        value={formData.brandDNA?.brandColors?.primary || '#2563eb'}
                        onChange={(e) =>
                          handleInputChange('brandDNA.brandColors.primary', e.target.value)
                        }
                        aria-label="Primary brand color"
                      />
                      <input
                        type="text"
                        className="flex-1 border-2 border-slate-300 px-3 py-2 text-sm rounded-lg focus:outline-none focus:border-blue-600"
                        value={formData.brandDNA?.brandColors?.primary || '#2563eb'}
                        onChange={(e) =>
                          handleInputChange('brandDNA.brandColors.primary', e.target.value)
                        }
                        placeholder="#2563eb"
                      />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <label className="block text-sm font-medium text-slate-700">Secondary Color</label>
                    <div className="flex items-center space-x-3">
                      <input
                        type="color"
                        className="w-12 h-12 border-2 border-slate-300 rounded-lg cursor-pointer hover:border-slate-400 transition-colors"
                        value={formData.brandDNA?.brandColors?.secondary || '#3b82f6'}
                        onChange={(e) =>
                          handleInputChange('brandDNA.brandColors.secondary', e.target.value)
                        }
                        aria-label="Secondary brand color"
                      />
                      <input
                        type="text"
                        className="flex-1 border-2 border-slate-300 px-3 py-2 text-sm rounded-lg focus:outline-none focus:border-blue-600"
                        value={formData.brandDNA?.brandColors?.secondary || '#3b82f6'}
                        onChange={(e) =>
                          handleInputChange('brandDNA.brandColors.secondary', e.target.value)
                        }
                        placeholder="#3b82f6"
                      />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <label className="block text-sm font-medium text-slate-700">Accent Color</label>
                    <div className="flex items-center space-x-3">
                      <input
                        type="color"
                        className="w-12 h-12 border-2 border-slate-300 rounded-lg cursor-pointer hover:border-slate-400 transition-colors"
                        value={formData.brandDNA?.brandColors?.accent || '#10b981'}
                        onChange={(e) =>
                          handleInputChange('brandDNA.brandColors.accent', e.target.value)
                        }
                        aria-label="Accent brand color"
                      />
                      <input
                        type="text"
                        className="flex-1 border-2 border-slate-300 px-3 py-2 text-sm rounded-lg focus:outline-none focus:border-blue-600"
                        value={formData.brandDNA?.brandColors?.accent || '#10b981'}
                        onChange={(e) =>
                          handleInputChange('brandDNA.brandColors.accent', e.target.value)
                        }
                        placeholder="#10b981"
                      />
                    </div>
                  </div>
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">Brand Personality Traits</label>
                <input
                  type="text"
                  className="w-full border-2 border-slate-300 px-4 py-3 text-base rounded-xl focus:outline-none focus:border-blue-600 focus:ring-4 focus:ring-blue-600/10 transition-all duration-200"
                  value={formData.brandDNA?.brandTone?.personality?.join(', ') || ''}
                  onChange={(e) =>
                    handleArrayInputChange('brandDNA.brandTone.personality', e.target.value)
                  }
                  placeholder="Professional, innovative, trustworthy, approachable, reliable"
                  aria-describedby="personality-help"
                />
                <p id="personality-help" className="text-sm text-slate-500 mt-1">Separate multiple traits with commas</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">Communication Style</label>
                <select
                  className="w-full border-2 border-slate-300 px-4 py-3 text-base rounded-xl focus:outline-none focus:border-blue-600 focus:ring-4 focus:ring-blue-600/10 transition-all duration-200 bg-white"
                  value={formData.brandDNA?.brandTone?.communicationStyle || ''}
                  onChange={(e) =>
                    handleInputChange('brandDNA.brandTone.communicationStyle', e.target.value)
                  }
                  aria-describedby="communication-help"
                >
                  <option value="">Select communication style</option>
                  <option value="formal">Formal & Professional</option>
                  <option value="conversational">Conversational & Friendly</option>
                  <option value="casual">Casual & Relaxed</option>
                  <option value="technical">Technical & Detailed</option>
                  <option value="authoritative">Authoritative & Expert</option>
                </select>
                <p id="communication-help" className="text-sm text-slate-500 mt-1">How your brand typically communicates with customers</p>
              </div>
            </div>
          </div>
        )

      case 3: // Value Propositions
        return (
          <div className="space-y-6">
            <div className="text-center mb-8">
              <h2 className="text-3xl font-bold text-gray-900">What Makes You Special?</h2>
              <p className="text-gray-600 mt-2">
                Your unique value propositions and core offerings
              </p>
            </div>
            <div className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Value Propositions *
                </label>
                <textarea
                  rows={4}
                  className="block w-full rounded-lg border-gray-300 shadow-sm focus:border-brand-primary focus:ring-brand-primary text-lg py-3"
                  value={formData.brandDNA?.valuePropositions?.join(', ') || ''}
                  onChange={(e) =>
                    handleArrayInputChange('brandDNA.valuePropositions', e.target.value)
                  }
                  placeholder="What unique value do you provide? What problems do you solve? (separate multiple values with commas)"
                />
                <p className="text-sm text-gray-500 mt-1">
                  Examples: "Increase sales by 50%", "Reduce costs by 30%", "Save 10 hours per week"
                </p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Core Products/Services *
                </label>
                <textarea
                  rows={4}
                  className="block w-full rounded-lg border-gray-300 shadow-sm focus:border-brand-primary focus:ring-brand-primary text-lg py-3"
                  value={formData.brandDNA?.coreOfferings?.join(', ') || ''}
                  onChange={(e) => handleArrayInputChange('brandDNA.coreOfferings', e.target.value)}
                  placeholder="Your main products or services (separate with commas)"
                />
                <p className="text-sm text-gray-500 mt-1">
                  Examples: "Marketing automation software", "Business consulting", "Web
                  development"
                </p>
              </div>
            </div>
          </div>
        )

      case 4: // Target Audience
        return (
          <div className="space-y-6">
            <div className="text-center mb-8">
              <h2 className="text-3xl font-bold text-gray-900">Who Are Your Ideal Customers?</h2>
              <p className="text-gray-600 mt-2">
                Define your target audience demographics and characteristics
              </p>
            </div>
            <div className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Demographics *
                </label>
                <textarea
                  rows={4}
                  className="block w-full rounded-lg border-gray-300 shadow-sm focus:border-brand-primary focus:ring-brand-primary text-lg py-3"
                  value={formData.brandDNA?.targetAudience?.demographics || ''}
                  onChange={(e) =>
                    handleInputChange('brandDNA.targetAudience.demographics', e.target.value)
                  }
                  placeholder="Age range, location, job titles, income level, company size, industry..."
                />
                <p className="text-sm text-gray-500 mt-1">
                  Examples: "CEOs of 50-500 person companies", "Marketing managers aged 25-45",
                  "Small business owners"
                </p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Psychographics
                </label>
                <textarea
                  rows={4}
                  className="block w-full rounded-lg border-gray-300 shadow-sm focus:border-brand-primary focus:ring-brand-primary text-lg py-3"
                  value={formData.brandDNA?.targetAudience?.psychographics || ''}
                  onChange={(e) =>
                    handleInputChange('brandDNA.targetAudience.psychographics', e.target.value)
                  }
                  placeholder="Values, interests, behaviors, lifestyle, goals, motivations..."
                />
                <p className="text-sm text-gray-500 mt-1">
                  Examples: "Values efficiency and ROI", "Early technology adopters",
                  "Growth-focused mindset"
                </p>
              </div>
            </div>
          </div>
        )

      case 5: // Pain Points
        return (
          <div className="space-y-6">
            <div className="text-center mb-8">
              <h2 className="text-3xl font-bold text-gray-900">What Problems Do They Face?</h2>
              <p className="text-gray-600 mt-2">
                Identify the key challenges your audience experiences
              </p>
            </div>
            <div className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Primary Pain Points *
                </label>
                <textarea
                  rows={5}
                  className="block w-full rounded-lg border-gray-300 shadow-sm focus:border-brand-primary focus:ring-brand-primary text-lg py-3"
                  value={formData.brandDNA?.targetAudience?.painPoints?.join(', ') || ''}
                  onChange={(e) =>
                    handleArrayInputChange('brandDNA.targetAudience.painPoints', e.target.value)
                  }
                  placeholder="What specific problems, challenges, or frustrations do they face? (separate with commas)"
                />
                <p className="text-sm text-gray-500 mt-1">
                  Examples: "Too much manual work", "Lack of visibility into performance",
                  "Difficulty scaling operations"
                </p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  How Do These Problems Impact Them?
                </label>
                <textarea
                  rows={3}
                  className="block w-full rounded-lg border-gray-300 shadow-sm focus:border-brand-primary focus:ring-brand-primary text-lg py-3"
                  value={formData.brandDNA?.targetAudience?.impact || ''}
                  onChange={(e) =>
                    handleInputChange('brandDNA.targetAudience.impact', e.target.value)
                  }
                  placeholder="Lost revenue, wasted time, increased stress, missed opportunities..."
                />
              </div>
            </div>
          </div>
        )

      case 6: // Marketing Strategy
        return (
          <div className="space-y-6">
            <div className="text-center mb-8">
              <h2 className="text-3xl font-bold text-gray-900">Your Marketing Strategy</h2>
              <p className="text-gray-600 mt-2">Goals, channels, and content approach</p>
            </div>
            <div className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Primary Marketing Goals *
                </label>
                <textarea
                  rows={3}
                  className="block w-full rounded-lg border-gray-300 shadow-sm focus:border-brand-primary focus:ring-brand-primary text-lg py-3"
                  value={formData.marketingGoals?.primaryGoals?.join(', ') || ''}
                  onChange={(e) =>
                    handleArrayInputChange('marketingGoals.primaryGoals', e.target.value)
                  }
                  placeholder="Brand awareness, lead generation, customer acquisition, thought leadership, etc. (separate with commas)"
                />
              </div>
              <div className="grid grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Content Frequency *
                  </label>
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
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Budget Range (Optional)
                  </label>
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
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Primary Marketing Channels *
                </label>
                <textarea
                  rows={3}
                  className="block w-full rounded-lg border-gray-300 shadow-sm focus:border-brand-primary focus:ring-brand-primary text-lg py-3"
                  value={formData.marketingGoals?.channels?.primary?.join(', ') || ''}
                  onChange={(e) =>
                    handleArrayInputChange('marketingGoals.channels.primary', e.target.value)
                  }
                  placeholder="Blog, LinkedIn, Email marketing, Google Ads, etc. (separate with commas)"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Secondary/Experimental Channels
                </label>
                <textarea
                  rows={3}
                  className="block w-full rounded-lg border-gray-300 shadow-sm focus:border-brand-primary focus:ring-brand-primary text-lg py-3"
                  value={formData.marketingGoals?.channels?.secondary?.join(', ') || ''}
                  onChange={(e) =>
                    handleArrayInputChange('marketingGoals.channels.secondary', e.target.value)
                  }
                  placeholder="Twitter, Instagram, YouTube, TikTok, podcasts, etc. (separate with commas)"
                />
              </div>
            </div>
          </div>
        )

      case 7: // Content Preferences
        return (
          <div className="space-y-6">
            <div className="text-center mb-8">
              <h2 className="text-3xl font-bold text-gray-900">Content Preferences</h2>
              <p className="text-gray-600 mt-2">What types of content work best for you?</p>
            </div>
            <div className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Preferred Content Types *
                </label>
                <textarea
                  rows={3}
                  className="block w-full rounded-lg border-gray-300 shadow-sm focus:border-brand-primary focus:ring-brand-primary text-lg py-3"
                  value={formData.contentPreferences?.contentTypes?.join(', ') || ''}
                  onChange={(e) =>
                    handleArrayInputChange('contentPreferences.contentTypes', e.target.value)
                  }
                  placeholder="Blog posts, videos, infographics, case studies, webinars, podcasts, etc. (separate with commas)"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-4">
                  Content Length Preferences
                </label>
                <div className="grid grid-cols-3 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Blog Posts (words)
                    </label>
                    <input
                      type="number"
                      className="block w-full rounded-lg border-gray-300 shadow-sm focus:border-brand-primary focus:ring-brand-primary text-lg py-3"
                      value={formData.contentPreferences?.lengthPreferences?.blog || 2000}
                      onChange={(e) =>
                        handleInputChange(
                          'contentPreferences.lengthPreferences.blog',
                          Number.parseInt(e.target.value)
                        )
                      }
                      min="500"
                      max="5000"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Social Posts (characters)
                    </label>
                    <input
                      type="number"
                      className="block w-full rounded-lg border-gray-300 shadow-sm focus:border-brand-primary focus:ring-brand-primary text-lg py-3"
                      value={formData.contentPreferences?.lengthPreferences?.social || 280}
                      onChange={(e) =>
                        handleInputChange(
                          'contentPreferences.lengthPreferences.social',
                          Number.parseInt(e.target.value)
                        )
                      }
                      min="50"
                      max="500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Email Content (words)
                    </label>
                    <input
                      type="number"
                      className="block w-full rounded-lg border-gray-300 shadow-sm focus:border-brand-primary focus:ring-brand-primary text-lg py-3"
                      value={formData.contentPreferences?.lengthPreferences?.email || 500}
                      onChange={(e) =>
                        handleInputChange(
                          'contentPreferences.lengthPreferences.email',
                          Number.parseInt(e.target.value)
                        )
                      }
                      min="100"
                      max="1000"
                    />
                  </div>
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Content Style Guidelines
                </label>
                <textarea
                  rows={3}
                  className="block w-full rounded-lg border-gray-300 shadow-sm focus:border-brand-primary focus:ring-brand-primary text-lg py-3"
                  value={formData.contentPreferences?.styleGuidelines?.join(', ') || ''}
                  onChange={(e) =>
                    handleArrayInputChange('contentPreferences.styleGuidelines', e.target.value)
                  }
                  placeholder="Data-driven, storytelling, educational, actionable, etc. (separate with commas)"
                />
              </div>
            </div>
          </div>
        )

      case 8: // AI Persona Setup
        return (
          <div className="space-y-6">
            <div className="text-center mb-8">
              <h2 className="text-3xl font-bold text-gray-900">AI Content Assistant Setup</h2>
              <p className="text-gray-600 mt-2">
                Configure your AI to match your brand voice and expertise
              </p>
            </div>
            <div className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  AI Personality Traits *
                </label>
                <textarea
                  rows={3}
                  className="block w-full rounded-lg border-gray-300 shadow-sm focus:border-brand-primary focus:ring-brand-primary text-lg py-3"
                  value={formData.aiPersona?.personalityTraits?.join(', ') || ''}
                  onChange={(e) =>
                    handleArrayInputChange('aiPersona.personalityTraits', e.target.value)
                  }
                  placeholder="Professional, friendly, analytical, creative, authoritative, approachable, etc. (separate with commas)"
                />
                <p className="text-sm text-gray-500 mt-1">
                  How should your AI assistant's personality come across in content?
                </p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Communication Pattern *
                </label>
                <textarea
                  rows={3}
                  className="block w-full rounded-lg border-gray-300 shadow-sm focus:border-brand-primary focus:ring-brand-primary text-lg py-3"
                  value={formData.aiPersona?.communicationPattern || ''}
                  onChange={(e) =>
                    handleInputChange('aiPersona.communicationPattern', e.target.value)
                  }
                  placeholder="Describe how the AI should communicate: formal tone with data backing, conversational with stories, direct and actionable, etc."
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Areas of Expertise
                </label>
                <textarea
                  rows={3}
                  className="block w-full rounded-lg border-gray-300 shadow-sm focus:border-brand-primary focus:ring-brand-primary text-lg py-3"
                  value={formData.aiPersona?.knowledgeAreas?.join(', ') || ''}
                  onChange={(e) =>
                    handleArrayInputChange('aiPersona.knowledgeAreas', e.target.value)
                  }
                  placeholder="Industry knowledge, technical skills, business topics the AI should be expert in (separate with commas)"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Content Constraints & Guidelines
                </label>
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
        )

      default:
        return null
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-blue-50">
      <div className="max-w-4xl mx-auto px-6 py-8">
        {/* Enhanced Header */}
        <div className="mb-8 text-center">
          <div className="inline-flex items-center px-4 py-2 rounded-full bg-blue-100 text-blue-700 text-sm font-medium mb-4">
            <svg className="w-4 h-4 mr-2" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M11.3 1.046A1 1 0 0112 2v5h4a1 1 0 01.82 1.573l-7 10A1 1 0 018 18v-5H4a1 1 0 01-.82-1.573l7-10a1 1 0 011.12-.38z" clipRule="evenodd" />
            </svg>
            AI-Powered Setup
          </div>
          <h1 className="text-3xl font-bold text-slate-900 mb-2">SLOTTED</h1>
          <p className="text-slate-600 mb-6">
            Step {currentStep + 1} of {steps.length} • {steps[currentStep]}
          </p>
          <div className="w-full max-w-md mx-auto bg-slate-200 h-2 rounded-full">
            <div
              className="bg-gradient-to-r from-blue-600 to-blue-700 h-2 rounded-full transition-all duration-500 ease-out"
              style={{ width: `${((currentStep + 1) / steps.length) * 100}%` }}
            />
          </div>
        </div>

        {/* Enhanced Content Container */}
        <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-xl border border-white/30 p-8">
          <div className="animate-fadeIn">
            {renderStep()}
          </div>

          {/* Enhanced Navigation */}
          <div className="flex justify-between items-center mt-12 pt-8 border-t border-slate-200">
            <button
              onClick={prevStep}
              disabled={currentStep === 0}
              className="group inline-flex items-center px-6 py-3 text-slate-700 bg-white border-2 border-slate-300 rounded-xl hover:border-slate-400 hover:bg-slate-50 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 touch-manipulation"
            >
              <svg className="w-4 h-4 mr-2 group-hover:-translate-x-1 transition-transform duration-200" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
              Back
            </button>

            {currentStep === steps.length - 1 ? (
              <button
                onClick={handleSubmit}
                disabled={isSubmitting}
                className="group inline-flex items-center px-8 py-3 text-white bg-gradient-to-r from-blue-600 to-blue-700 rounded-xl hover:from-blue-700 hover:to-blue-800 disabled:opacity-50 disabled:cursor-not-allowed transform hover:scale-105 transition-all duration-200 shadow-lg hover:shadow-xl touch-manipulation"
              >
                {isSubmitting ? (
                  <>
                    <div className="w-4 h-4 mr-2 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    Creating...
                  </>
                ) : (
                  <>
                    Complete Setup
                    <svg className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform duration-200" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4" />
                    </svg>
                  </>
                )}
              </button>
            ) : (
              <button
                onClick={nextStep}
                className="group inline-flex items-center px-8 py-3 text-white bg-gradient-to-r from-blue-600 to-blue-700 rounded-xl hover:from-blue-700 hover:to-blue-800 transform hover:scale-105 transition-all duration-200 shadow-lg hover:shadow-xl touch-manipulation"
              >
                Continue
                <svg className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform duration-200" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
