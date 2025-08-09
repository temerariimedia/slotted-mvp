// React code for the Slotted Onboarding Start Page UI
// Uses Tailwind CSS for styling with modern design patterns

import React from 'react'

interface SlottedStartPageProps {
  onBeginOnboarding: () => void
  onSkipToDashboard: () => void
}

export default function SlottedStartPage({
  onBeginOnboarding,
  onSkipToDashboard,
}: SlottedStartPageProps) {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-blue-50 relative overflow-hidden">
      {/* Background decoration */}
      <div className="absolute inset-0 opacity-30">
        <div
          className="absolute inset-0"
          style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23e2e8f0' fill-opacity='0.4'%3E%3Ccircle cx='30' cy='30' r='1.5'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
          }}
        ></div>
      </div>

      <div className="relative flex flex-col items-center justify-center min-h-screen px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
        {/* Hero Section */}
        <div className="text-center mb-8 sm:mb-12 lg:mb-16 max-w-full sm:max-w-3xl lg:max-w-5xl xl:max-w-6xl">
          <h1 className="text-3xl sm:text-5xl lg:text-6xl font-extrabold text-blue-600 mb-3 sm:mb-4 tracking-tight leading-tight">
            SLOTTED
          </h1>
          <h2 className="text-xl sm:text-2xl lg:text-3xl text-slate-800 mb-3 sm:mb-5 font-medium">
            AI-Powered Marketing Command Center
          </h2>
          <p className="text-sm sm:text-base lg:text-lg text-slate-600 max-w-full sm:max-w-2xl lg:max-w-3xl mx-auto leading-relaxed px-4">
            A comprehensive platform for planning, organizing, and generating marketing content with intelligent AI assistance.
          </p>
        </div>

        {/* Features Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8 mb-8 sm:mb-12 lg:mb-16 w-full max-w-full sm:max-w-3xl lg:max-w-5xl xl:max-w-6xl">
          <div className="group relative sm:col-span-1">
            <div className="relative bg-white p-6 sm:p-8 rounded-xl sm:rounded-2xl border border-slate-200 shadow-md hover:shadow-lg transition-all duration-300 hover:-translate-y-1">
              <div className="w-10 h-10 sm:w-12 sm:h-12 bg-blue-100 text-blue-600 rounded-xl flex items-center justify-center mb-4 sm:mb-6 group-hover:scale-105 transition-transform duration-200">
                <svg
                  className="w-5 h-5 sm:w-6 sm:h-6"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M8 7V3m8 4V3m-9 4h10a2 2 0 012 2v10a2 2 0 01-2 2H7a2 2 0 01-2-2V9a2 2 0 012-2z"
                  />
                </svg>
              </div>
              <h3 className="text-lg sm:text-xl font-bold text-slate-900 mb-2 sm:mb-3">
                Marketing Calendar
              </h3>
              <p className="text-sm sm:text-base text-slate-700 leading-relaxed">
                Plan and visualize content across all your platforms
              </p>
            </div>
          </div>

          <div className="group relative sm:col-span-1">
            <div className="relative bg-white p-6 sm:p-8 rounded-xl sm:rounded-2xl border border-slate-200 shadow-md hover:shadow-lg transition-all duration-300 hover:-translate-y-1">
              <div className="w-10 h-10 sm:w-12 sm:h-12 bg-purple-100 text-purple-600 rounded-xl flex items-center justify-center mb-4 sm:mb-6 group-hover:scale-105 transition-transform duration-200">
                <svg
                  className="w-5 h-5 sm:w-6 sm:h-6"
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
              <h3 className="text-lg sm:text-xl font-bold text-slate-900 mb-2 sm:mb-3">
                AI Content Generation
              </h3>
              <p className="text-sm sm:text-base text-slate-700 leading-relaxed">
                Create engaging content with intelligent AI assistance
              </p>
            </div>
          </div>

          <div className="group relative sm:col-span-2 lg:col-span-1">
            <div className="relative bg-white p-6 sm:p-8 rounded-xl sm:rounded-2xl border border-slate-200 shadow-md hover:shadow-lg transition-all duration-300 hover:-translate-y-1">
              <div className="w-10 h-10 sm:w-12 sm:h-12 bg-emerald-100 text-emerald-600 rounded-xl flex items-center justify-center mb-4 sm:mb-6 group-hover:scale-105 transition-transform duration-200">
                <svg
                  className="w-5 h-5 sm:w-6 sm:h-6"
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
              <h3 className="text-lg sm:text-xl font-bold text-slate-900 mb-2 sm:mb-3">
                Performance Tracking
              </h3>
              <p className="text-sm sm:text-base text-slate-700 leading-relaxed">
                Measure and optimize your marketing efforts
              </p>
            </div>
          </div>
        </div>

        {/* CTA Section */}
        <div className="relative w-full max-w-full sm:max-w-2xl lg:max-w-3xl">
          <div className="absolute inset-0 bg-gradient-to-r from-blue-600 to-purple-600 rounded-2xl sm:rounded-3xl blur opacity-15"></div>
            <div className="relative bg-white p-6 sm:p-8 lg:p-10 rounded-2xl sm:rounded-3xl border border-slate-200 shadow-xl text-center">
            <h2 className="text-xl sm:text-2xl lg:text-3xl font-bold text-slate-900 mb-3 sm:mb-4">
              Get Started in Minutes
            </h2>
            <p className="text-sm sm:text-base lg:text-lg text-slate-700 mb-6 sm:mb-8 leading-relaxed px-2">
              SLOTTED guides you through a simple onboarding process to set up your marketing foundation and create your first AI-generated content.
            </p>

            <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-center gap-3 sm:gap-4">
              <button
                onClick={onBeginOnboarding}
                className="group relative inline-flex items-center justify-center min-h-[48px] px-6 sm:px-8 py-3 sm:py-4 text-base sm:text-lg font-semibold text-white bg-gradient-to-r from-blue-600 to-blue-700 rounded-xl sm:rounded-2xl hover:from-blue-700 hover:to-blue-800 transform hover:scale-105 transition-all duration-200 shadow-lg hover:shadow-xl touch-manipulation"
              >
                <span className="relative z-10">Begin Onboarding</span>
                <svg
                  className="ml-2 w-5 h-5 group-hover:translate-x-1 transition-transform duration-200"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M13 7l5 5m0 0l-5 5m5-5H6"
                  />
                </svg>
              </button>

              <button
                onClick={onSkipToDashboard}
                className="inline-flex items-center justify-center min-h-[48px] px-6 sm:px-8 py-3 sm:py-4 text-base sm:text-lg font-semibold text-slate-700 bg-white border-2 border-slate-300 rounded-xl sm:rounded-2xl hover:border-slate-400 hover:bg-slate-50 transition-all duration-200 shadow-md hover:shadow-lg touch-manipulation"
              >
                <span>Skip Onboarding and Go to Dashboard</span>
                <svg className="ml-2 w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M14 5l7 7m0 0l-7 7m7-7H3"
                  />
                </svg>
              </button>
            </div>

            <p className="text-xs sm:text-sm text-slate-600 mt-4 sm:mt-6">
              No credit card required • Setup takes less than 5 minutes
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
