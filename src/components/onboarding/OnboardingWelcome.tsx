import React, { useState } from 'react'
import { motion } from 'framer-motion'
import { Progress } from '../ui/progress'
import { Button } from '../ui/button'
import { CheckCircle2, Clock, Users, Zap } from 'lucide-react'

interface OnboardingWelcomeProps {
  onStart: () => void
  onSkip?: () => void
}

export function OnboardingWelcome({ onStart, onSkip }: OnboardingWelcomeProps) {
  const [isStarting, setIsStarting] = useState(false)

  const handleStart = async () => {
    setIsStarting(true)
    // Small delay for better UX
    await new Promise(resolve => setTimeout(resolve, 500))
    onStart()
  }

  const features = [
    {
      icon: <CheckCircle2 className="w-5 h-5" />,
      title: "Complete Business Analysis",
      description: "AI-powered company DNA extraction and competitive analysis"
    },
    {
      icon: <Clock className="w-5 h-5" />,
      title: "Strategic Planning",
      description: "13-week marketing calendar with channel optimization"
    },
    {
      icon: <Users className="w-5 h-5" />,
      title: "Content Generation", 
      description: "Blog posts, social media, and email campaigns tailored to your brand"
    },
    {
      icon: <Zap className="w-5 h-5" />,
      title: "Revenue Optimization",
      description: "Pricing strategy and value proposition development"
    }
  ]

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-100">
      {/* Progress indicator */}
      <div className="absolute top-0 left-0 w-full">
        <Progress value={0} className="h-1 border-none bg-gray-200" />
      </div>

      <div className="flex min-h-screen items-center justify-center p-6">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="w-full max-w-4xl"
        >
          <div className="bg-white rounded-3xl shadow-2xl overflow-hidden">
            {/* Header section */}
            <div className="bg-gradient-to-r from-blue-600 to-purple-600 text-white p-12 text-center">
              <motion.div
                initial={{ scale: 0.9 }}
                animate={{ scale: 1 }}
                transition={{ delay: 0.2, duration: 0.5 }}
              >
                <div className="w-20 h-20 bg-white/20 rounded-full flex items-center justify-center mx-auto mb-6">
                  <Zap className="w-10 h-10" />
                </div>
                <h1 className="text-4xl font-bold mb-4">Welcome to Slotted</h1>
                <p className="text-xl text-blue-100 mb-6 max-w-2xl mx-auto">
                  Transform your marketing with AI-powered omnichannel campaigns. 
                  Let's build your complete marketing strategy in just 15 minutes.
                </p>
                <div className="flex items-center justify-center space-x-6 text-blue-100">
                  <div className="flex items-center space-x-2">
                    <Clock className="w-4 h-4" />
                    <span className="text-sm">15 minutes</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Users className="w-4 h-4" />
                    <span className="text-sm">15 steps</span>
                  </div>
                </div>
              </motion.div>
            </div>

            {/* Content section */}
            <div className="p-12">
              <div className="text-center mb-12">
                <h2 className="text-2xl font-semibold text-gray-900 mb-4">
                  What You'll Get
                </h2>
                <p className="text-gray-600 max-w-2xl mx-auto">
                  Our AI will analyze your business, create marketing strategies, and generate 
                  ready-to-use content tailored to your brand voice and target audience.
                </p>
              </div>

              {/* Features grid */}
              <div className="grid md:grid-cols-2 gap-8 mb-12">
                {features.map((feature, index) => (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.4 + index * 0.1, duration: 0.5 }}
                    className="flex items-start space-x-4 p-6 rounded-2xl bg-gray-50 hover:bg-gray-100 transition-colors"
                  >
                    <div className="flex-shrink-0 w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center text-blue-600">
                      {feature.icon}
                    </div>
                    <div>
                      <h3 className="font-semibold text-gray-900 mb-2">
                        {feature.title}
                      </h3>
                      <p className="text-gray-600 text-sm">
                        {feature.description}
                      </p>
                    </div>
                  </motion.div>
                ))}
              </div>

              {/* CTA section */}
              <div className="text-center space-y-6">
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.8, duration: 0.5 }}
                >
                  <Button
                    onClick={handleStart}
                    disabled={isStarting}
                    size="lg"
                    className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white px-12 py-4 text-lg rounded-2xl shadow-lg hover:shadow-xl transition-all duration-200 transform hover:scale-105"
                  >
                    {isStarting ? (
                      <>
                        <div className="w-5 h-5 mr-2 border-2 border-white border-t-transparent rounded-full animate-spin" />
                        Starting...
                      </>
                    ) : (
                      <>
                        Start Your Marketing Journey
                        <Zap className="w-5 h-5 ml-2" />
                      </>
                    )}
                  </Button>
                </motion.div>

                {onSkip && (
                  <div className="text-sm">
                    <button
                      onClick={onSkip}
                      className="text-gray-500 hover:text-gray-700 underline"
                    >
                      Skip setup (use demo data)
                    </button>
                  </div>
                )}

                <div className="text-xs text-gray-500 max-w-md mx-auto">
                  By continuing, you agree to let our AI analyze your business and create 
                  personalized marketing content. All data is securely stored and never shared.
                </div>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  )
}