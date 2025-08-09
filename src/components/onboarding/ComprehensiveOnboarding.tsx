/**
 * ComprehensiveOnboarding.tsx
 * Complete 13-step onboarding flow including Google Drive integration
 */

import React, { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Button } from '../ui/button'
import { Progress } from '../ui/progress'
import { Badge } from '../ui/badge'
import { CheckCircle2, ChevronLeft, ChevronRight } from 'lucide-react'
import { useSlottedContext } from '../../contexts/SlottedContext'

// Import all onboarding steps
import { OnboardingWelcome } from './OnboardingWelcome'
import SuccessMetrics from './SuccessMetrics'
import BrandVoice from './BrandVoice'
import BrandPersonality from './BrandPersonality'
import StyleGuide from './StyleGuide'
import AICloneSetup from './AICloneSetup'
import GoogleDriveIntegration from './GoogleDriveIntegration'
import ContentPipeline from './ContentPipeline'
import Dashboard from './Dashboard'

interface Step {
  id: string
  title: string
  description: string
  component: React.ComponentType<any>
  completed?: boolean
}

interface ComprehensiveOnboardingProps {
  onComplete: () => void
}

export default function ComprehensiveOnboarding({ onComplete }: ComprehensiveOnboardingProps) {
  const [slottedData, setSlottedData] = useSlottedContext()
  const [currentStepIndex, setCurrentStepIndex] = useState(0)
  
  // Define all 9 onboarding steps
  const steps: Step[] = [
    {
      id: 'welcome',
      title: 'Welcome',
      description: 'Getting started with Slotted',
      component: OnboardingWelcome
    },
    {
      id: 'success-metrics',
      title: 'Success Metrics',
      description: 'Define your KPIs and goals',
      component: SuccessMetrics
    },
    {
      id: 'brand-voice',
      title: 'Brand Voice',
      description: 'Configure your brand tone',
      component: BrandVoice
    },
    {
      id: 'brand-personality',
      title: 'Brand Personality',
      description: 'Define personality traits',
      component: BrandPersonality
    },
    {
      id: 'style-guide',
      title: 'Style Guide',
      description: 'Visual brand elements',
      component: StyleGuide
    },
    {
      id: 'ai-clone',
      title: 'AI Clone Setup',
      description: 'Configure AI for brand consistency',
      component: AICloneSetup
    },
    {
      id: 'google-drive',
      title: 'Google Drive',
      description: 'Workspace integration',
      component: GoogleDriveIntegration
    },
    {
      id: 'content-pipeline',
      title: 'Content Pipeline',
      description: 'Generation workflow setup',
      component: ContentPipeline
    },
    {
      id: 'dashboard',
      title: 'Dashboard',
      description: 'Setup complete & next steps',
      component: Dashboard
    }
  ]

  const currentStep = steps[currentStepIndex]
  const progress = ((currentStepIndex + 1) / steps.length) * 100

  const handleNext = () => {
    // Mark current step as completed
    const updatedSteps = [...steps]
    updatedSteps[currentStepIndex].completed = true
    
    if (currentStepIndex < steps.length - 1) {
      setCurrentStepIndex(currentStepIndex + 1)
    } else {
      // Complete onboarding
      setSlottedData({
        ...slottedData,
        currentPhase: 'complete',
        metadata: {
          ...slottedData.metadata,
          updatedAt: new Date().toISOString(),
          completedAt: new Date().toISOString()
        }
      })
      onComplete()
    }
  }

  const handlePrevious = () => {
    if (currentStepIndex > 0) {
      setCurrentStepIndex(currentStepIndex - 1)
    }
  }

  const handleSkipToStep = (stepIndex: number) => {
    if (stepIndex >= 0 && stepIndex < steps.length) {
      setCurrentStepIndex(stepIndex)
    }
  }

  const CurrentStepComponent = currentStep.component

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
      <div className="max-w-6xl mx-auto p-6">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">
                Slotted Setup
              </h1>
              <p className="text-gray-600">
                Step {currentStepIndex + 1} of {steps.length}: {currentStep.title}
              </p>
            </div>
            
            <div className="flex items-center space-x-2">
              <span className="text-sm font-medium text-gray-600">
                {Math.round(progress)}% Complete
              </span>
              <div className="w-24 h-2 bg-gray-200 rounded-full overflow-hidden">
                <motion.div
                  className="h-full bg-gradient-to-r from-blue-500 to-purple-600"
                  initial={{ width: 0 }}
                  animate={{ width: `${progress}%` }}
                  transition={{ duration: 0.5, ease: "easeInOut" }}
                />
              </div>
            </div>
          </div>

          {/* Step Progress Indicators */}
          <div className="flex items-center space-x-2 mb-6 overflow-x-auto pb-2">
            {steps.map((step, index) => (
              <button
                key={step.id}
                onClick={() => handleSkipToStep(index)}
                className={`flex items-center space-x-2 px-3 py-2 rounded-lg text-sm font-medium transition-colors flex-shrink-0 ${
                  index === currentStepIndex
                    ? 'bg-blue-100 text-blue-700 border-2 border-blue-300'
                    : index < currentStepIndex
                    ? 'bg-green-100 text-green-700 border-2 border-green-300'
                    : 'bg-gray-100 text-gray-500 border-2 border-gray-200 hover:bg-gray-200'
                }`}
              >
                {step.completed || index < currentStepIndex ? (
                  <CheckCircle2 className="h-4 w-4" />
                ) : (
                  <span className="w-4 h-4 rounded-full border-2 border-current flex-shrink-0" />
                )}
                <span className="whitespace-nowrap">{step.title}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Step Content */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
          <div className="p-8">
            <AnimatePresence mode="wait">
              <motion.div
                key={currentStep.id}
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.3 }}
              >
                <CurrentStepComponent
                  onNext={handleNext}
                  onBack={handlePrevious}
                  isFirst={currentStepIndex === 0}
                  isLast={currentStepIndex === steps.length - 1}
                />
              </motion.div>
            </AnimatePresence>
          </div>
        </div>

        {/* Footer Navigation */}
        <div className="flex justify-between items-center mt-8">
          <div className="flex items-center space-x-4">
            {currentStepIndex > 0 && (
              <Button
                variant="outline"
                onClick={handlePrevious}
                className="flex items-center space-x-2"
              >
                <ChevronLeft className="h-4 w-4" />
                <span>Previous</span>
              </Button>
            )}
          </div>

          <div className="flex items-center space-x-4">
            <div className="text-sm text-gray-500">
              {currentStepIndex + 1} of {steps.length} steps
            </div>
            
            {currentStepIndex < steps.length - 1 ? (
              <Button
                onClick={handleNext}
                className="flex items-center space-x-2 bg-blue-600 hover:bg-blue-700"
              >
                <span>Next</span>
                <ChevronRight className="h-4 w-4" />
              </Button>
            ) : (
              <Button
                onClick={handleNext}
                className="flex items-center space-x-2 bg-green-600 hover:bg-green-700"
              >
                <CheckCircle2 className="h-4 w-4" />
                <span>Complete Setup</span>
              </Button>
            )}
          </div>
        </div>

        {/* Quick Stats */}
        <div className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-white p-4 rounded-lg border border-gray-200">
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">Steps Completed</span>
              <Badge variant="outline">{currentStepIndex} / {steps.length}</Badge>
            </div>
          </div>
          
          <div className="bg-white p-4 rounded-lg border border-gray-200">
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">Current Phase</span>
              <Badge variant="default">Onboarding</Badge>
            </div>
          </div>
          
          <div className="bg-white p-4 rounded-lg border border-gray-200">
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">Progress</span>
              <Badge variant="secondary">{Math.round(progress)}%</Badge>
            </div>
          </div>
        </div>

        {/* Help Text */}
        <div className="mt-6 text-center">
          <p className="text-sm text-gray-500">
            Need help? Each step builds on the previous one to create your complete marketing setup.
          </p>
        </div>
      </div>
    </div>
  )
}