import React, { useState, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { OnboardingWelcome } from './OnboardingWelcome'
import { OnboardingForm } from './OnboardingForm'
import { StepIndicator } from '../ui/step-indicator'
import { useSlottedContext } from '../../contexts/SlottedContext'
import type { SlottedContext } from '../../schemas/slottedContext'

interface OnboardingWizardProps {
  onComplete: (context: SlottedContext) => void
}

export function OnboardingWizard({ onComplete }: OnboardingWizardProps) {
  const [currentView, setCurrentView] = useState<'welcome' | 'form'>('welcome')
  const [showStepIndicator, setShowStepIndicator] = useState(false)
  const { context } = useSlottedContext()

  // Define the 15 onboarding steps
  const onboardingSteps = [
    { id: 'welcome', title: 'Welcome', description: 'Getting started' },
    { id: 'company-basics', title: 'Company', description: 'Basic info' },
    { id: 'company-details', title: 'Details', description: 'About you' },
    { id: 'brand-identity', title: 'Brand', description: 'Visual identity' },
    { id: 'value-props', title: 'Value', description: 'What you offer' },
    { id: 'target-audience', title: 'Audience', description: 'Who you serve' },
    { id: 'pain-points', title: 'Problems', description: 'What you solve' },
    { id: 'marketing-strategy', title: 'Strategy', description: 'Your approach' },
    { id: 'content-preferences', title: 'Content', description: 'Style & format' },
    { id: 'ai-persona', title: 'AI Setup', description: 'Voice & tone' },
    { id: 'competitive-analysis', title: 'Competitors', description: 'Market research' },
    { id: 'pricing-strategy', title: 'Pricing', description: 'Value packaging' },
    { id: 'channels', title: 'Channels', description: 'Distribution' },
    { id: 'calendar', title: 'Planning', description: 'Timeline' },
    { id: 'review', title: 'Review', description: 'Final check' }
  ]

  const handleStart = useCallback(() => {
    setCurrentView('form')
    setShowStepIndicator(true)
  }, [])

  const handleSkip = useCallback(() => {
    // Skip to MVP1 with minimal demo data
    const demoContext: SlottedContext = {
      company: {
        name: 'Demo Company',
        industry: 'SaaS',
        size: 'startup',
        description: 'A demo company for testing Slotted features',
        website: 'https://demo.com'
      },
      brandDNA: {
        brandColors: {
          primary: '#2563eb',
          secondary: '#3b82f6',
          accent: '#10b981'
        },
        brandTone: {
          personality: ['professional', 'innovative', 'trustworthy'],
          voiceAttributes: ['friendly', 'helpful', 'expert'],
          communicationStyle: 'conversational'
        },
        valuePropositions: ['Increase efficiency by 50%', 'Reduce costs by 30%'],
        coreOfferings: ['Software platform', 'Consulting services'],
        targetAudience: {
          demographics: 'Business professionals',
          psychographics: 'Growth-minded individuals',
          painPoints: ['Time constraints', 'Budget limitations']
        }
      },
      marketingGoals: {
        primaryGoals: ['Generate leads', 'Build brand awareness'],
        kpis: ['conversion rate', 'website traffic'],
        cadence: 'weekly',
        channels: {
          primary: ['Website', 'Email'],
          secondary: ['Social media'],
          experimental: ['Podcasts']
        }
      },
      gtmStrategy: {
        segments: [],
        competitiveAdvantage: 'AI-powered efficiency',
        marketPosition: 'Innovative solution provider'
      },
      contentPreferences: {
        contentTypes: ['Blog posts', 'Email campaigns'],
        lengthPreferences: {
          blog: 2000,
          social: 280,
          email: 500
        },
        styleGuidelines: ['Professional', 'Data-driven']
      },
      aiPersona: {
        personalityTraits: ['helpful', 'professional', 'knowledgeable'],
        communicationPattern: 'Clear and actionable advice',
        knowledgeAreas: ['Marketing', 'Business strategy'],
        constraints: ['Keep it professional', 'Avoid jargon']
      },
      currentPhase: 'mvp1',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    }
    onComplete(demoContext)
  }, [onComplete])

  const handleFormComplete = useCallback((completedContext: SlottedContext) => {
    onComplete(completedContext)
  }, [onComplete])

  const containerVariants = {
    initial: { opacity: 0 },
    animate: { opacity: 1 },
    exit: { opacity: 0 }
  }

  const slideVariants = {
    initial: { x: 20, opacity: 0 },
    animate: { x: 0, opacity: 1 },
    exit: { x: -20, opacity: 0 }
  }

  return (
    <div className="min-h-screen">
      {/* Step indicator - only show during form */}
      <AnimatePresence>
        {showStepIndicator && currentView === 'form' && (
          <motion.div
            initial={{ y: -50, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: -50, opacity: 0 }}
            className="fixed top-0 left-0 right-0 bg-white/95 backdrop-blur-sm border-b border-gray-200 z-50 p-4"
          >
            <StepIndicator
              currentStep={1} // This will be dynamic based on form progress
              totalSteps={15}
              steps={onboardingSteps}
            />
          </motion.div>
        )}
      </AnimatePresence>

      {/* Main content */}
      <motion.div
        variants={containerVariants}
        initial="initial"
        animate="animate"
        exit="exit"
        className={showStepIndicator ? 'pt-32' : ''}
      >
        <AnimatePresence mode="wait">
          {currentView === 'welcome' ? (
            <motion.div
              key="welcome"
              variants={slideVariants}
              initial="initial"
              animate="animate"
              exit="exit"
              transition={{ duration: 0.3 }}
            >
              <OnboardingWelcome
                onStart={handleStart}
                onSkip={handleSkip}
              />
            </motion.div>
          ) : (
            <motion.div
              key="form"
              variants={slideVariants}
              initial="initial"
              animate="animate"
              exit="exit"
              transition={{ duration: 0.3 }}
            >
              <OnboardingForm onComplete={handleFormComplete} />
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    </div>
  )
}