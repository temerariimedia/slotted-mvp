/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_OPENAI_API_KEY: string
  readonly VITE_ANTHROPIC_API_KEY: string
  readonly VITE_GOOGLE_AI_API_KEY: string
  readonly VITE_STRIPE_PUBLISHABLE_KEY: string
  readonly VITE_APP_URL: string
  readonly VITE_ENVIRONMENT: string
  readonly VITE_ENABLE_MVP1: string
  readonly VITE_ENABLE_MVP2: string
  readonly VITE_ENABLE_MVP3: string
  readonly VITE_ENABLE_PAYMENTS: string
  readonly VITE_ENABLE_ANALYTICS: string
}

interface ImportMeta {
  readonly env: ImportMetaEnv
}
