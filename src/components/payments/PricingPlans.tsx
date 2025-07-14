import React, { useState } from 'react'
import { MVP1_PLANS, stripeProcessor, type PaymentPlan } from '@/services/payments/stripe-integration'

interface PricingPlansProps {
  onPlanSelected: (planId: string) => void
  currentUserEmail?: string
}

export const PricingPlans: React.FC<PricingPlansProps> = ({ 
  onPlanSelected, 
  currentUserEmail 
}) => {
  const [isProcessing, setIsProcessing] = useState(false)
  const [selectedPlan, setSelectedPlan] = useState<string | null>(null)
  const [userEmail, setUserEmail] = useState(currentUserEmail || '')
  const [companyName, setCompanyName] = useState('')

  const handlePlanSelect = async (plan: PaymentPlan) => {
    if (!userEmail || !companyName) {
      alert('Please enter your email and company name')
      return
    }

    setIsProcessing(true)
    setSelectedPlan(plan.id)

    try {
      const session = await stripeProcessor.createPaymentSession({
        planId: plan.id,
        customerEmail: userEmail,
        companyName: companyName,
        successUrl: `${window.location.origin}/payment-success`,
        cancelUrl: `${window.location.origin}/payment-cancelled`,
      })

      // In production, redirect to Stripe checkout
      // For demo, simulate immediate success
      console.log(`Redirecting to: ${session.checkoutUrl}`)
      
      // Simulate payment success after 2 seconds
      setTimeout(() => {
        alert(`Payment successful! You now have access to ${plan.name}`)
        onPlanSelected(plan.id)
        setIsProcessing(false)
        setSelectedPlan(null)
      }, 2000)

    } catch (error) {
      console.error('Payment failed:', error)
      alert('Payment failed. Please try again.')
      setIsProcessing(false)
      setSelectedPlan(null)
    }
  }

  return (
    <div className="bg-white py-12">
      <div className="max-w-7xl mx-auto px-6">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold text-gray-900 mb-4">
            Choose Your Plan
          </h2>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Get comprehensive company DNA analysis with our AI-powered tools. 
            Start with a single analysis or save with bulk packages.
          </p>
        </div>

        {/* User Input Form */}
        <div className="max-w-md mx-auto mb-8 p-6 bg-gray-50 rounded-lg">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">
            Your Information
          </h3>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Email Address
              </label>
              <input
                type="email"
                value={userEmail}
                onChange={(e) => setUserEmail(e.target.value)}
                placeholder="your@email.com"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Company Name
              </label>
              <input
                type="text"
                value={companyName}
                onChange={(e) => setCompanyName(e.target.value)}
                placeholder="Your Company Inc."
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                required
              />
            </div>
          </div>
        </div>

        {/* Pricing Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-5xl mx-auto">
          {MVP1_PLANS.map((plan) => (
            <div
              key={plan.id}
              className={`relative bg-white rounded-2xl shadow-lg border-2 transition-all duration-200 ${
                plan.popular 
                  ? 'border-blue-500 transform scale-105' 
                  : 'border-gray-200 hover:border-blue-300'
              }`}
            >
              {plan.popular && (
                <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
                  <span className="bg-blue-500 text-white px-4 py-2 rounded-full text-sm font-semibold">
                    Most Popular
                  </span>
                </div>
              )}

              <div className="p-8">
                <div className="text-center mb-6">
                  <h3 className="text-2xl font-bold text-gray-900 mb-2">
                    {plan.name}
                  </h3>
                  <p className="text-gray-600 mb-4">
                    {plan.description}
                  </p>
                  <div className="text-4xl font-bold text-gray-900 mb-2">
                    ${plan.price}
                    <span className="text-lg font-normal text-gray-600">
                      {plan.limitations.analysesPerMonth === 1 ? ' / analysis' : ' / package'}
                    </span>
                  </div>
                </div>

                <ul className="space-y-3 mb-8">
                  {plan.features.map((feature, index) => (
                    <li key={index} className="flex items-start">
                      <svg className="w-5 h-5 text-green-500 mt-0.5 mr-3 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                      </svg>
                      <span className="text-gray-700">{feature}</span>
                    </li>
                  ))}
                </ul>

                <button
                  onClick={() => handlePlanSelect(plan)}
                  disabled={isProcessing || !userEmail || !companyName}
                  className={`w-full py-3 px-6 rounded-lg font-semibold transition-colors ${
                    plan.popular
                      ? 'bg-blue-600 text-white hover:bg-blue-700'
                      : 'bg-gray-900 text-white hover:bg-gray-800'
                  } disabled:opacity-50 disabled:cursor-not-allowed`}
                >
                  {isProcessing && selectedPlan === plan.id ? (
                    <div className="flex items-center justify-center">
                      <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                      Processing...
                    </div>
                  ) : (
                    `Get ${plan.name}`
                  )}
                </button>

                {/* Plan limitations */}
                <div className="mt-4 text-xs text-gray-500">
                  <p>• {plan.limitations.analysesPerMonth} analysis{plan.limitations.analysesPerMonth !== 1 ? 'es' : ''}</p>
                  <p>• {plan.limitations.websiteAnalysis ? 'Website analysis included' : 'Basic analysis only'}</p>
                  <p>• AI models: {plan.limitations.aiModels.join(', ')}</p>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Value Proposition */}
        <div className="mt-16 text-center">
          <h3 className="text-2xl font-bold text-gray-900 mb-4">
            Why Choose Slotted DNA Extractor?
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-4xl mx-auto">
            <div className="text-center">
              <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-8 h-8 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
              </div>
              <h4 className="text-lg font-semibold text-gray-900 mb-2">
                30 Minutes vs 30 Hours
              </h4>
              <p className="text-gray-600">
                Get comprehensive brand analysis in minutes, not days of manual research.
              </p>
            </div>
            
            <div className="text-center">
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                </svg>
              </div>
              <h4 className="text-lg font-semibold text-gray-900 mb-2">
                Latest AI Technology
              </h4>
              <p className="text-gray-600">
                Powered by GPT-4, Claude 3.5 Sonnet, and Gemini 2.0 for the most accurate analysis.
              </p>
            </div>
            
            <div className="text-center">
              <div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-8 h-8 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                </svg>
              </div>
              <h4 className="text-lg font-semibold text-gray-900 mb-2">
                Secure & Professional
              </h4>
              <p className="text-gray-600">
                Enterprise-grade security with professional JSON exports ready for any system.
              </p>
            </div>
          </div>
        </div>

        {/* Money-back guarantee */}
        <div className="mt-12 text-center">
          <div className="bg-green-50 border border-green-200 rounded-lg p-6 max-w-md mx-auto">
            <div className="flex items-center justify-center mb-2">
              <svg className="w-6 h-6 text-green-600 mr-2" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
              </svg>
              <span className="text-green-800 font-semibold">100% Satisfaction Guarantee</span>
            </div>
            <p className="text-green-700 text-sm">
              Not happy with your analysis? Get a full refund within 7 days, no questions asked.
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}