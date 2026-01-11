import { vi, beforeAll, afterEach, afterAll } from 'vitest'
import { config } from '@vue/test-utils'
import { createPinia, setActivePinia } from 'pinia'
import { server } from './mocks/server'

// Démarre MSW avant tous les tests
beforeAll(() => {
  server.listen({ onUnhandledRequest: 'error' })
  // Crée une instance Pinia pour les tests
  const pinia = createPinia()
  setActivePinia(pinia)
})

// Réinitialise les handlers après chaque test
afterEach(() => {
  server.resetHandlers()
  vi.clearAllMocks()
})

// Nettoie après tous les tests
afterAll(() => {
  server.close()
})

// Mock de localStorage
const localStorageMock = {
  getItem: vi.fn(),
  setItem: vi.fn(),
  removeItem: vi.fn(),
  clear: vi.fn(),
  key: vi.fn(),
  length: 0
}

Object.defineProperty(window, 'localStorage', {
  value: localStorageMock,
  writable: true
})

// Mock de sessionStorage
const sessionStorageMock = {
  getItem: vi.fn(),
  setItem: vi.fn(),
  removeItem: vi.fn(),
  clear: vi.fn(),
  key: vi.fn(),
  length: 0
}

Object.defineProperty(window, 'sessionStorage', {
  value: sessionStorageMock,
  writable: true
})

// Mock des variables d'environnement
vi.stubEnv('VITE_API_URL', 'http://localhost:3333')
vi.stubEnv('VITE_API_BASE_URL', 'http://localhost:3333')
vi.stubEnv('VITE_CLOUDINARY_CLOUD_NAME', 'test-cloud')
vi.stubEnv('VITE_CLOUDINARY_UPLOAD_PRESET', 'test-preset')

// Configuration globale pour Vue Test Utils
config.global.stubs = {
  'router-link': true,
  'router-view': true
}

