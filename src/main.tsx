import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App-modern'
import './index.css'

// Initialize error boundary for development
if (import.meta.env.DEV) {
  // Development-only error handling
  window.addEventListener('unhandledrejection', (event) => {
    console.error('Unhandled promise rejection:', event.reason)
  })
  
  window.addEventListener('error', (event) => {
    console.error('Global error:', event.error)
  })
}

// Initialize performance monitoring
if (import.meta.env.PROD) {
  // Production performance monitoring
  if ('performance' in window) {
    window.addEventListener('load', () => {
      const navigation = performance.getEntriesByType('navigation')[0] as PerformanceNavigationTiming
      console.log('Page load time:', navigation.loadEventEnd - navigation.fetchStart, 'ms')
    })
  }
}

// Initialize service worker for PWA (if needed in future)
if (import.meta.env.PROD && 'serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    // Register service worker for caching (to be implemented)
    console.log('Service worker registration ready')
  })
}

// Render the app
const rootElement = document.getElementById('root')
if (!rootElement) {
  throw new Error('Root element not found')
}

const root = ReactDOM.createRoot(rootElement)

root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
)