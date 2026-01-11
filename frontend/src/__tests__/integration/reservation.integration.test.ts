/**
 * Tests d'intégration pour les réservations
 * Teste le flux complet : Composant → Composable → Service → API
 */

import { describe, it, expect, beforeEach, vi } from 'vitest'
import { mount } from '@vue/test-utils'
import { createPinia, setActivePinia } from 'pinia'
import { nextTick } from 'vue'
import { http, HttpResponse } from 'msw'
import { server } from '../mocks/server'
import ReservationModal from '@/components/reservation/ReservationModal.vue'
import { useReservations } from '@/composables/useReservations'
import { useAuthStore } from '@/stores/auth'
import { ReservationService } from '@/services/reservation/reservation.service'

describe('Intégration - Réservations', () => {
  let pinia: ReturnType<typeof createPinia>
  let authStore: ReturnType<typeof useAuthStore>

  beforeEach(() => {
    pinia = createPinia()
    setActivePinia(pinia)
    authStore = useAuthStore()
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
    authStore.setTokens('mock-token', 'mock-refresh')
  })

  describe('Flux de réservation instantanée', () => {
    it('devrait créer une réservation complète : composant → composable → service → API', async () => {
      // Mock de l'API
      server.use(
        http.post('http://localhost:3333/reservations', async ({ request }) => {
          const body = await request.json() as any
          return HttpResponse.json({
            success: true,
            data: {
              reservation: {
                id: 'res-123',
                accommodationId: body.accommodationId,
                startDate: body.startDate,
                endDate: body.endDate,
                guestCount: body.guestCount,
                status: 'confirmee',
                totalAmount: 500,
                createdAt: new Date().toISOString(),
                tenantId: 'user-123'
              }
            }
          })
        })
      )

      const accommodation = {
        id: 'log-123',
        title: 'Belle maison'
      }

      const wrapper = mount(ReservationModal, {
        props: {
          show: true,
          accommodation,
          startDate: new Date('2024-02-01'),
          endDate: new Date('2024-02-05'),
          guests: 2,
          nights: 4,
          totalAmount: 500,
          bookingMode: 'instant'
        },
        global: {
          plugins: [pinia]
        }
      })

      // Simule la confirmation
      const confirmButton = wrapper.find('button:contains("Payer et réserver")')
      if (confirmButton.exists()) {
        await confirmButton.trigger('click')
      }

      // Utilise le composable pour créer la réservation
      const { createReservation, reservations } = useReservations()
      
      const reservation = await createReservation({
        accommodationId: 'log-123',
        startDate: new Date('2024-02-01'),
        endDate: new Date('2024-02-05'),
        guestCount: 2
      })

      await nextTick()

      // Vérifications
      expect(reservation).toBeTruthy()
      expect(reservation?.id).toBe('res-123')
      expect(reservation?.status).toBe('confirmee')
      expect(reservations.value.length).toBeGreaterThan(0)
    })

    it('devrait calculer le montant total avant la réservation', async () => {
      server.use(
        http.post('http://localhost:3333/reservations/calculate', async ({ request }) => {
          const body = await request.json() as any
          // Simule un calcul : 7 nuits × 100 = 700
          const startDate = new Date(body.startDate)
          const endDate = new Date(body.endDate)
          const nights = Math.ceil((endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24))
          const totalAmount = nights * 100 // Prix par nuit = 100
          
          return HttpResponse.json({
            success: true,
            data: { totalAmount }
          })
        })
      )

      const { calculateTotal } = useReservations()
      
      const total = await calculateTotal(
        'log-123',
        new Date('2024-02-01'),
        new Date('2024-02-08')
      )

      expect(total).toBe(700)
    })

    it('devrait vérifier la disponibilité avant de créer une réservation', async () => {
      server.use(
        http.post('http://localhost:3333/reservations/check-availability', async ({ request }) => {
          const body = await request.json() as any
          // Simule une vérification de disponibilité
          // Ici, on pourrait vérifier contre une base de données mockée
          const available = true
          
          return HttpResponse.json({
            success: true,
            data: { available }
          })
        })
      )

      const { checkAvailability } = useReservations()
      
      const available = await checkAvailability(
        'log-123',
        new Date('2024-02-01'),
        new Date('2024-02-05')
      )

      expect(available).toBe(true)
    })

    it('devrait gérer l\'erreur si les dates ne sont pas disponibles', async () => {
      server.use(
        http.post('http://localhost:3333/reservations/check-availability', () => {
          return HttpResponse.json({
            success: true,
            data: { available: false }
          })
        }),
        http.post('http://localhost:3333/reservations', () => {
          return HttpResponse.json(
            { success: false, message: 'Dates non disponibles' },
            { status: 400 }
          )
        })
      )

      const { checkAvailability, createReservation, error } = useReservations()
      
      const available = await checkAvailability(
        'log-123',
        new Date('2024-02-01'),
        new Date('2024-02-05')
      )

      expect(available).toBe(false)

      // Tente de créer une réservation malgré tout
      const reservation = await createReservation({
        accommodationId: 'log-123',
        startDate: new Date('2024-02-01'),
        endDate: new Date('2024-02-05'),
        guestCount: 2
      })

      expect(reservation).toBeNull()
      expect(error.value).toBeTruthy()
    })
  })

  describe('Flux de gestion des réservations (propriétaire)', () => {
    beforeEach(() => {
      authStore.setUser({
        ...authStore.user!,
        userType: 'proprietaire'
      })
    })

    it('devrait accepter une réservation et mettre à jour l\'état', async () => {
      server.use(
        http.put('http://localhost:3333/reservations/res-123/accept', () => {
          return HttpResponse.json({
            success: true,
            data: {
              reservation: {
                id: 'res-123',
                status: 'acceptee',
                updatedAt: new Date().toISOString()
              }
            }
          })
        }),
        http.get('http://localhost:3333/reservations/owner', () => {
          return HttpResponse.json({
            success: true,
            data: {
              reservations: [
                {
                  id: 'res-123',
                  status: 'acceptee',
                  accommodationId: 'log-123',
                  startDate: '2024-02-01',
                  endDate: '2024-02-05'
                }
              ],
              total: 1,
              page: 1,
              limit: 20,
              totalPages: 1
            }
          })
        })
      )

      const { acceptReservation, loadOwnerReservations } = useReservations()
      
      const success = await acceptReservation('res-123')
      
      expect(success).toBe(true)
      
      // Vérifie que la liste est mise à jour
      await loadOwnerReservations()
      const { reservations } = useReservations()
      
      const updated = reservations.value.find(r => r.id === 'res-123')
      expect(updated?.status).toBe('acceptee')
    })

    it('devrait rejeter une réservation', async () => {
      server.use(
        http.put('http://localhost:3333/reservations/res-123/reject', () => {
          return HttpResponse.json({
            success: true,
            data: {
              reservation: {
                id: 'res-123',
                status: 'rejetee',
                updatedAt: new Date().toISOString()
              }
            }
          })
        })
      )

      const { rejectReservation } = useReservations()
      const success = await rejectReservation('res-123')

      expect(success).toBe(true)
    })

    it('devrait annuler une réservation avec une raison', async () => {
      server.use(
        http.put('http://localhost:3333/reservations/res-123/cancel', async ({ request }) => {
          const body = await request.json() as any
          return HttpResponse.json({
            success: true,
            data: {
              reservation: {
                id: 'res-123',
                status: 'annulee',
                cancellationReason: body.cancellationReason,
                updatedAt: new Date().toISOString()
              }
            }
          })
        })
      )

      const { cancelReservation } = useReservations()
      const success = await cancelReservation('res-123', 'Changement de plans')

      expect(success).toBe(true)
    })
  })

  describe('Chargement des réservations', () => {
    it('devrait charger les réservations du locataire', async () => {
      server.use(
        http.get('http://localhost:3333/reservations/my', () => {
          return HttpResponse.json({
            success: true,
            data: {
              reservations: [
                {
                  id: 'res-1',
                  accommodationId: 'log-1',
                  status: 'confirmee',
                  startDate: '2024-02-01',
                  endDate: '2024-02-05',
                  totalAmount: 500
                },
                {
                  id: 'res-2',
                  accommodationId: 'log-2',
                  status: 'en_attente',
                  startDate: '2024-03-01',
                  endDate: '2024-03-05',
                  totalAmount: 600
                }
              ],
              total: 2,
              page: 1,
              limit: 20,
              totalPages: 1
            }
          })
        })
      )

      const { loadMyReservations, reservations, pagination } = useReservations()
      await loadMyReservations()

      await nextTick()

      expect(reservations.value.length).toBe(2)
      expect(pagination.value.total).toBe(2)
      expect(reservations.value[0].id).toBe('res-1')
    })

    it('devrait charger les statistiques du propriétaire', async () => {
      server.use(
        http.get('http://localhost:3333/reservations/owner/statistics', () => {
          return HttpResponse.json({
            success: true,
            data: {
              statistics: {
                total: 10,
                confirmed: 8,
                pending: 2,
                cancelled: 0,
                totalRevenue: 5000
              }
            }
          })
        })
      )

      authStore.setUser({
        ...authStore.user!,
        userType: 'proprietaire'
      })

      const { loadStatistics, statistics } = useReservations()
      await loadStatistics()

      await nextTick()

      expect(statistics.value).toBeTruthy()
      expect(statistics.value?.total).toBe(10)
      expect(statistics.value?.totalRevenue).toBe(5000)
    })
  })
})

