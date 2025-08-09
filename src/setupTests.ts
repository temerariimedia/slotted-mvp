// jest-dom adds custom jest matchers for asserting on DOM nodes.
// allows you to do things like:
// expect(element).toHaveTextContent(/react/i)
// learn more: https://github.com/testing-library/jest-dom
import '@testing-library/jest-dom'

// Mock localStorage for testing environments
const localStorageMock = {
  getItem: (key: string) => {
    return localStorageMock.store[key] || null
  },
  setItem: (key: string, value: string) => {
    localStorageMock.store[key] = value
  },
  removeItem: (key: string) => {
    delete localStorageMock.store[key]
  },
  clear: () => {
    localStorageMock.store = {}
  },
  store: {} as Record<string, string>
}

Object.defineProperty(window, 'localStorage', {
  value: localStorageMock
})

// Mock document for zustand persistence
Object.defineProperty(global, 'document', {
  value: {
    createElement: () => ({
      style: {}
    }),
    head: {
      appendChild: () => {}
    }
  },
  writable: true
})
