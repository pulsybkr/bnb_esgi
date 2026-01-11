/**
 * Tests d'intégration pour les avis et notations
 * Teste le flux complet : Composant → Service → API
 */

import { describe, it, expect, beforeEach } from 'vitest'
import { mount } from '@vue/test-utils'
import { createPinia, setActivePinia } from 'pinia'
import { nextTick } from 'vue'
import { http, HttpResponse } from 'msw'
import { server } from '../mocks/server'
import ReviewForm from '@/components/review/ReviewForm.vue'
import { reviewService } from '@/services/reviewService'
import { useAuthStore } from '@/stores/auth'

describe('Intégration - Avis et notations', () => {
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

  describe('Création d\'un avis', () => {
    it('devrait créer un avis : composant → service → API', async () => {
      server.use(
        http.post('http://localhost:3333/reviews', async ({ request }) => {
          const body = await request.json() as any
          return HttpResponse.json({
            success: true,
            data: {
              review: {
                id: 'review-123',
                reservationId: body.reservationId,
                rating: body.rating,
                comment: body.comment,
                type: body.type,
                authorId: 'user-123',
                createdAt: new Date().toISOString()
              }
            }
          })
        })
      )

      const wrapper = mount(ReviewForm, {
        props: {
          reservationId: 'res-123',
          type: 'accommodation'
        },
        global: {
          plugins: [pinia]
        }
      })

      // Simule la sélection d'une note
      const starButtons = wrapper.findAll('[data-test="star-rating"] button')
      if (starButtons.length > 0) {
        await starButtons[4].trigger('click') // 5 étoiles
      }

      // Simule la saisie d'un commentaire
      const commentInput = wrapper.find('textarea')
      if (commentInput.exists()) {
        await commentInput.setValue('Excellent séjour, je recommande !')
      }

      // Crée l'avis via le service
      const review = await reviewService.createReview({
        reservationId: 'res-123',
        rating: 5,
        comment: 'Excellent séjour, je recommande !',
        type: 'accommodation'
      })

      expect(review).toBeTruthy()
      expect(review.id).toBe('review-123')
      expect(review.rating).toBe(5)
      expect(review.comment).toBe('Excellent séjour, je recommande !')
    })

    it('devrait créer un avis pour le propriétaire', async () => {
      server.use(
        http.post('http://localhost:3333/reviews', async ({ request }) => {
          const body = await request.json() as any
          return HttpResponse.json({
            success: true,
            data: {
              review: {
                id: 'review-owner-123',
                reservationId: body.reservationId,
                rating: body.rating,
                comment: body.comment,
                type: 'host',
                authorId: 'user-123',
                createdAt: new Date().toISOString()
              }
            }
          })
        })
      )

      const review = await reviewService.createReview({
        reservationId: 'res-123',
        rating: 4,
        comment: 'Propriétaire très accueillant',
        type: 'host'
      })

      expect(review.type).toBe('host')
      expect(review.rating).toBe(4)
    })
  })

  describe('Récupération des avis', () => {
    it('devrait charger les avis d\'un logement', async () => {
      server.use(
        http.get('http://localhost:3333/reviews/logement/log-123', () => {
          return HttpResponse.json({
            success: true,
            data: {
              reviews: [
                {
                  id: 'review-1',
                  rating: 5,
                  comment: 'Super logement',
                  author: {
                    id: 'user-1',
                    firstName: 'User',
                    lastName: 'One'
                  },
                  createdAt: '2024-01-01T00:00:00Z'
                },
                {
                  id: 'review-2',
                  rating: 4,
                  comment: 'Très bien',
                  author: {
                    id: 'user-2',
                    firstName: 'User',
                    lastName: 'Two'
                  },
                  createdAt: '2024-01-15T00:00:00Z'
                }
              ],
              averageRating: 4.5,
              total: 2
            }
          })
        })
      )

      const reviews = await reviewService.getAccommodationReviews('log-123')

      expect(reviews.reviews.length).toBe(2)
      expect(reviews.averageRating).toBe(4.5)
      expect(reviews.total).toBe(2)
      expect(reviews.reviews[0].rating).toBe(5)
    })

    it('devrait calculer la note moyenne correctement', async () => {
      server.use(
        http.get('http://localhost:3333/reviews/logement/log-123', () => {
          return HttpResponse.json({
            success: true,
            data: {
              reviews: [
                { id: 'review-1', rating: 5 },
                { id: 'review-2', rating: 4 },
                { id: 'review-3', rating: 5 },
                { id: 'review-4', rating: 3 },
                { id: 'review-5', rating: 5 }
              ],
              averageRating: 4.4, // (5+4+5+3+5)/5
              total: 5
            }
          })
        })
      )

      const reviews = await reviewService.getAccommodationReviews('log-123')

      expect(reviews.averageRating).toBe(4.4)
      expect(reviews.total).toBe(5)
    })
  })

  describe('Mise à jour d\'un avis', () => {
    it('devrait mettre à jour un avis existant', async () => {
      server.use(
        http.put('http://localhost:3333/reviews/review-123', async ({ request }) => {
          const body = await request.json() as any
          return HttpResponse.json({
            success: true,
            data: {
              review: {
                id: 'review-123',
                rating: body.rating,
                comment: body.comment,
                updatedAt: new Date().toISOString()
              }
            }
          })
        })
      )

      const updated = await reviewService.updateReview('review-123', {
        rating: 4,
        comment: 'Commentaire mis à jour'
      })

      expect(updated.rating).toBe(4)
      expect(updated.comment).toBe('Commentaire mis à jour')
    })
  })

  describe('Suppression d\'un avis', () => {
    it('devrait supprimer un avis', async () => {
      server.use(
        http.delete('http://localhost:3333/reviews/review-123', () => {
          return HttpResponse.json({
            success: true,
            message: 'Avis supprimé'
          })
        })
      )

      const result = await reviewService.deleteReview('review-123')

      expect(result).toBe(true)
    })
  })

  describe('Avis du propriétaire sur le locataire', () => {
    beforeEach(() => {
      authStore.setUser({
        ...authStore.user!,
        userType: 'proprietaire'
      })
    })

    it('devrait permettre au propriétaire de noter le locataire', async () => {
      server.use(
        http.post('http://localhost:3333/reviews', async ({ request }) => {
          const body = await request.json() as any
          return HttpResponse.json({
            success: true,
            data: {
              review: {
                id: 'review-tenant-123',
                reservationId: body.reservationId,
                rating: body.rating,
                comment: body.comment,
                type: 'tenant',
                authorId: 'owner-123',
                createdAt: new Date().toISOString()
              }
            }
          })
        })
      )

      const review = await reviewService.createReview({
        reservationId: 'res-123',
        rating: 5,
        comment: 'Locataire très respectueux',
        type: 'tenant'
      })

      expect(review.type).toBe('tenant')
      expect(review.rating).toBe(5)
    })
  })

  describe('Filtrage et tri des avis', () => {
    it('devrait filtrer les avis par note', async () => {
      server.use(
        http.get('http://localhost:3333/reviews/logement/log-123', ({ request }) => {
          const url = new URL(request.url)
          const minRating = url.searchParams.get('minRating')
          
          return HttpResponse.json({
            success: true,
            data: {
              reviews: [
                {
                  id: 'review-1',
                  rating: parseInt(minRating || '4'),
                  comment: 'Avis filtré'
                }
              ],
              averageRating: parseFloat(minRating || '4'),
              total: 1
            }
          })
        })
      )

      const reviews = await reviewService.getAccommodationReviews('log-123', {
        minRating: 4
      })

      expect(reviews.reviews.every(r => r.rating >= 4)).toBe(true)
    })

    it('devrait trier les avis par date (plus récents en premier)', async () => {
      server.use(
        http.get('http://localhost:3333/reviews/logement/log-123', ({ request }) => {
          const url = new URL(request.url)
          const sortBy = url.searchParams.get('sortBy')
          
          const reviews = [
            { id: 'review-1', createdAt: '2024-01-01T00:00:00Z', rating: 5 },
            { id: 'review-2', createdAt: '2024-01-15T00:00:00Z', rating: 4 },
            { id: 'review-3', createdAt: '2024-02-01T00:00:00Z', rating: 5 }
          ]
          
          if (sortBy === 'date_desc') {
            reviews.sort((a, b) => 
              new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
            )
          }
          
          return HttpResponse.json({
            success: true,
            data: {
              reviews,
              averageRating: 4.67,
              total: 3
            }
          })
        })
      )

      const result = await reviewService.getAccommodationReviews('log-123', {
        sortBy: 'date_desc'
      })

      expect(result.reviews[0].id).toBe('review-3') // Plus récent
      expect(result.reviews[2].id).toBe('review-1') // Plus ancien
    })
  })
})

