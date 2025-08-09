import {
  MVP2_PLANS,
  type PaymentPlan,
  stripeProcessor,
} from '@/services/payments/stripe-integration'
import type React from 'react'
import { useState } from 'react'

interface MVP2PricingPlansProps {
  onPlanSelected: (planId: string) => void
  currentUserEmail?: string
  companyDNA?: any
}

export const MVP2PricingPlans: React.FC<MVP2PricingPlansProps> = ({
  onPlanSelected,
  currentUserEmail,
  companyDNA,
}) => {
  const [isProcessing, setIsProcessing] = useState(false)
  const [selectedPlan, setSelectedPlan] = useState<string | null>(null)
  const [userEmail, setUserEmail] = useState(currentUserEmail || '')
  const [companyName, setCompanyName] = useState(companyDNA?.company?.name || '')

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
        successUrl: `${window.location.origin}/payment-success?mvp=2`,
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
            Choose Your Marketing Calendar Plan
          </h2>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Generate comprehensive 13-week marketing calendars with strategic campaign planning.
            Choose the plan that fits your business needs.
          </p>
        </div>

        {/* Company DNA Integration Notice */}
        {companyDNA && (
          <div className="bg-green-50 border border-green-200 rounded-lg p-6 mb-8 max-w-2xl mx-auto">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <svg className="h-5 w-5 text-green-400" fill="currentColor" viewBox="0 0 20 20">
                  <path
                    fillRule="evenodd"
                    d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                    clipRule="evenodd"
                  />
                </svg>
              </div>
              <div className="ml-3">
                <h3 className="text-sm font-medium text-green-800">
                  Company DNA Integration Available
                </h3>
                <div className="mt-1 text-sm text-green-700">
                  Your calendar will be personalized using DNA from:{' '}
                  <strong>{companyDNA.company.name}</strong>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* User Input Form */}
        <div className="max-w-md mx-auto mb-8 p-6 bg-gray-50 rounded-lg">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Your Information</h3>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Email Address</label>
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
              <label className="block text-sm font-medium text-gray-700 mb-2">Company Name</label>
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
          {MVP2_PLANS.map((plan) => (
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
                  <h3 className="text-2xl font-bold text-gray-900 mb-2">{plan.name}</h3>
                  <p className="text-gray-600 mb-4">{plan.description}</p>
                  <div className="text-4xl font-bold text-gray-900 mb-2">
                    ${plan.price}
                    <span className="text-lg font-normal text-gray-600">
                      {plan.limitations.analysesPerMonth === 1 ? ' / calendar' : ' / package'}
                    </span>
                  </div>
                </div>

                <ul className="space-y-3 mb-8">
                  {plan.features.map((feature, index) => (
                    <li key={index} className="flex items-start">
                      <svg
                        className="w-5 h-5 text-green-500 mt-0.5 mr-3 flex-shrink-0"
                        fill="currentColor"
                        viewBox="0 0 20 20"
                      >
                        <path
                          fillRule="evenodd"
                          d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                          clipRule="evenodd"
                        />
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
                  <p>
                    • {plan.limitations.analysesPerMonth} calendar
                    {plan.limitations.analysesPerMonth !== 1 ? 's' : ''}
                  </p>
                  <p>
                    •{' '}
                    {plan.limitations.websiteAnalysis
                      ? 'Company DNA integration'
                      : 'Basic calendar only'}
                  </p>
                  <p>• AI models: {plan.limitations.aiModels.join(', ')}</p>
                  <p>• Export formats: {plan.limitations.exportFormats.join(', ').toUpperCase()}</p>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Value Proposition */}
        <div className="mt-16 text-center">
          <h3 className="text-2xl font-bold text-gray-900 mb-4">
            Why Choose Slotted Marketing Calendar?
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-4xl mx-auto">
            <div className="text-center">
              <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg
                  className="w-8 h-8 text-blue-600"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
                  />
                </svg>
              </div>
              <h4 className="text-lg font-semibold text-gray-900 mb-2">
                13-Week Strategic Planning
              </h4>
              <p className="text-gray-600">
                Get a complete quarterly marketing strategy with campaign themes, content types, and
                optimal timing.
              </p>
            </div>

            <div className="text-center">
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg
                  className="w-8 h-8 text-green-600"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M13 10V3L4 14h7v7l9-11h-7z"
                  />
                </svg>
              </div>
              <h4 className="text-lg font-semibold text-gray-900 mb-2">10 Minutes vs 10 Hours</h4>
              <p className="text-gray-600">
                Generate comprehensive marketing calendars in minutes instead of spending days
                planning campaigns.
              </p>
            </div>

            <div className="text-center">
              <div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg
                  className="w-8 h-8 text-purple-600"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"
                  />
                </svg>
              </div>
              <h4 className="text-lg font-semibold text-gray-900 mb-2">Ready-to-Use Exports</h4>
              <p className="text-gray-600">
                Export directly to Google Sheets, CSV, or JSON format for immediate use in your
                existing tools.
              </p>
            </div>
          </div>
        </div>

        {/* Money-back guarantee */}
        <div className="mt-12 text-center">
          <div className="bg-green-50 border border-green-200 rounded-lg p-6 max-w-md mx-auto">
            <div className="flex items-center justify-center mb-2">
              <svg className="w-6 h-6 text-green-600 mr-2" fill="currentColor" viewBox="0 0 20 20">
                <path
                  fillRule="evenodd"
                  d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                  clipRule="evenodd"
                />
              </svg>
              <span className="text-green-800 font-semibold">100% Satisfaction Guarantee</span>
            </div>
            <p className="text-green-700 text-sm">
              Not happy with your marketing calendar? Get a full refund within 7 days, no questions
              asked.
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
