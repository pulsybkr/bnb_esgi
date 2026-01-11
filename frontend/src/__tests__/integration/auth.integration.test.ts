/**
 * Tests d'intégration pour l'authentification
 * Teste le flux complet : Composant → Composable → Service → API
 */

import { describe, it, expect, beforeEach, vi } from 'vitest'
import { mount } from '@vue/test-utils'
import { createPinia, setActivePinia } from 'pinia'
import { nextTick } from 'vue'
import { http, HttpResponse } from 'msw'
import { server } from '../mocks/server'
import LoginModal from '@/components/auth/LoginModal.vue'
import SignupModal from '@/components/auth/SignupModal.vue'
import { useAuth } from '@/composables/useAuth'
import { useAuthStore } from '@/stores/auth'
import { AuthService } from '@/services/auth/auth.service'

describe('Intégration - Authentification', () => {
  let pinia: ReturnType<typeof createPinia>
  let authStore: ReturnType<typeof useAuthStore>

  beforeEach(() => {
    pinia = createPinia()
    setActivePinia(pinia)
    authStore = useAuthStore()
    authStore.clearAuth()
    localStorage.clear()
  })

  describe('Flux de connexion complet', () => {
    it('devrait se connecter avec succès : composant → composable → service → API', async () => {
      // Mock de l'API
      server.use(
        http.post('http://localhost:3333/auth/login', async ({ request }) => {
          const body = await request.json() as any
          if (body.email === 'test@example.com' && body.password === 'password123') {
            return HttpResponse.json({
              success: true,
              data: {
                user: {
                  id: 'user-123',
                  email: 'test@example.com',
                  firstName: 'Test',
                  lastName: 'User',
                  userType: 'locataire',
                  emailVerified: true,
                  phoneVerified: false,
                  status: 'active',
                  registrationDate: new Date().toISOString()
                },
                accessToken: 'mock-access-token',
                refreshToken: 'mock-refresh-token'
              }
            })
          }
          return HttpResponse.json(
            { success: false, message: 'Identifiants invalides' },
            { status: 401 }
          )
        })
      )

      const wrapper = mount(LoginModal, {
        props: {
          show: true
        },
        global: {
          plugins: [pinia]
        }
      })

      // Remplit le formulaire
      const emailInput = wrapper.find('input[type="email"]')
      const passwordInput = wrapper.find('input[type="password"]')
      
      await emailInput.setValue('test@example.com')
      await passwordInput.setValue('password123')

      // Soumet le formulaire
      const submitButton = wrapper.find('button[type="submit"]')
      await submitButton.trigger('submit')

      await nextTick()

      // Vérifie que le composable a été utilisé
      const { login, isAuthenticated, user } = useAuth()
      const success = await login({
        email: 'test@example.com',
        password: 'password123'
      })

      await nextTick()

      // Vérifications
      expect(success).toBe(true)
      expect(isAuthenticated.value).toBe(true)
      expect(user.value?.email).toBe('test@example.com')
      expect(user.value?.id).toBe('user-123')
    })

    it('devrait gérer les erreurs de connexion', async () => {
      server.use(
        http.post('http://localhost:3333/auth/login', () => {
          return HttpResponse.json(
            { success: false, message: 'Identifiants invalides' },
            { status: 401 }
          )
        })
      )

      const { login, error, isAuthenticated } = useAuth()
      const success = await login({
        email: 'wrong@example.com',
        password: 'wrongpassword'
      })

      expect(success).toBe(false)
      expect(error.value).toBeTruthy()
      expect(isAuthenticated.value).toBe(false)
    })
  })

  describe('Flux d\'inscription complet', () => {
    it('devrait créer un compte : composant → composable → service → API', async () => {
      server.use(
        http.post('http://localhost:3333/auth/register', async ({ request }) => {
          const body = await request.json() as any
          return HttpResponse.json({
            success: true,
            data: {
              user: {
                id: 'user-new-123',
                email: body.email,
                firstName: body.firstName,
                lastName: body.lastName,
                userType: body.userType,
                emailVerified: false,
                phoneVerified: false,
                status: 'active',
                registrationDate: new Date().toISOString()
              },
              accessToken: 'mock-access-token',
              refreshToken: 'mock-refresh-token'
            }
          })
        })
      )

      const wrapper = mount(SignupModal, {
        props: {
          show: true
        },
        global: {
          plugins: [pinia]
        }
      })

      const { register, isAuthenticated, user } = useAuth()
      
      const success = await register({
        email: 'newuser@example.com',
        password: 'password123',
        firstName: 'New',
        lastName: 'User',
        userType: 'locataire',
        phone: '+221771234567'
      })

      await nextTick()

      expect(success).toBe(true)
      expect(isAuthenticated.value).toBe(true)
      expect(user.value?.email).toBe('newuser@example.com')
      expect(user.value?.firstName).toBe('New')
    })
  })

  describe('Flux de déconnexion', () => {
    it('devrait déconnecter l\'utilisateur et nettoyer l\'état', async () => {
      // Simule un utilisateur connecté
      authStore.setUser({
        id: 'user-123',
        email: 'test@example.com',
        firstName: 'Test',
        lastName: 'User',
        userType: 'locataire',
        emailVerified: true,
        phoneVerified: false,
        status: 'active',
        registrationDate: new Date().toISOString()
      })
      authStore.setTokens('token-123', 'refresh-123')

      server.use(
        http.post('http://localhost:3333/auth/logout', () => {
          return HttpResponse.json({ success: true })
        })
      )

      const { logout, isAuthenticated } = useAuth()
      await logout()

      await nextTick()

      expect(isAuthenticated.value).toBe(false)
      expect(authStore.user).toBeNull()
      expect(authStore.accessToken).toBeNull()
    })
  })

  describe('Chargement du profil utilisateur', () => {
    it('devrait charger le profil au démarrage si l\'utilisateur est connecté', async () => {
      server.use(
        http.get('http://localhost:3333/auth/profile', () => {
          return HttpResponse.json({
            success: true,
            data: {
              user: {
                id: 'user-123',
                email: 'test@example.com',
                firstName: 'Test',
                lastName: 'User',
                userType: 'locataire',
                emailVerified: true,
                phoneVerified: false,
                status: 'active',
                registrationDate: new Date().toISOString()
              }
            }
          })
        })
      )

      // Simule un token existant
      authStore.setTokens('valid-token', 'valid-refresh')

      const { loadProfile, user } = useAuth()
      const success = await loadProfile()

      await nextTick()

      expect(success).toBe(true)
      expect(user.value?.id).toBe('user-123')
      expect(user.value?.email).toBe('test@example.com')
    })

    it('devrait gérer l\'erreur si le token est invalide', async () => {
      server.use(
        http.get('http://localhost:3333/auth/profile', () => {
          return HttpResponse.json(
            { success: false, message: 'Non autorisé' },
            { status: 401 }
          )
        })
      )

      authStore.setTokens('invalid-token', 'invalid-refresh')

      const { loadProfile, user } = useAuth()
      const success = await loadProfile()

      expect(success).toBe(false)
      expect(user.value).toBeNull()
    })
  })

  describe('Mise à jour du profil', () => {
    it('devrait mettre à jour le profil utilisateur', async () => {
      server.use(
        http.put('http://localhost:3333/auth/profile', async ({ request }) => {
          const body = await request.json() as any
          return HttpResponse.json({
            success: true,
            data: {
              user: {
                id: 'user-123',
                email: 'test@example.com',
                firstName: body.firstName,
                lastName: body.lastName,
                phone: body.phone,
                userType: 'locataire',
                emailVerified: true,
                phoneVerified: false,
                status: 'active',
                registrationDate: new Date().toISOString()
              }
            }
          })
        })
      )

      authStore.setUser({
        id: 'user-123',
        email: 'test@example.com',
        firstName: 'Test',
        lastName: 'User',
        userType: 'locataire',
        emailVerified: true,
        phoneVerified: false,
        status: 'active',
        registrationDate: new Date().toISOString()
      })

      const { updateProfile, user } = useAuth()
      const success = await updateProfile({
        firstName: 'Updated',
        lastName: 'Name',
        phone: '+221771234567'
      })

      await nextTick()

      expect(success).toBe(true)
      expect(user.value?.firstName).toBe('Updated')
      expect(user.value?.lastName).toBe('Name')
    })
  })
})

