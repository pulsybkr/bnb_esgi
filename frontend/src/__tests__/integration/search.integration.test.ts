/**
 * Tests d'intégration pour la recherche
 * Teste le flux complet : Composant → Service → API
 */

import { describe, it, expect, beforeEach } from 'vitest'
import { mount } from '@vue/test-utils'
import { createPinia, setActivePinia } from 'pinia'
import { nextTick } from 'vue'
import { http, HttpResponse } from 'msw'
import { server } from '../mocks/server'
import FilterSidebar from '@/components/search/FilterSidebar.vue'
import { useLogements } from '@/composables/useLogements'
import { LogementService } from '@/services/logement/logement.service'
import { useAuthStore } from '@/stores/auth'

describe('Intégration - Recherche', () => {
  let pinia: ReturnType<typeof createPinia>
  let authStore: ReturnType<typeof useAuthStore>

  beforeEach(() => {
    pinia = createPinia()
    setActivePinia(pinia)
    authStore = useAuthStore()
    authStore.setTokens('mock-token', 'mock-refresh')
  })

  describe('Recherche de base', () => {
    it('devrait rechercher des logements par localisation', async () => {
      server.use(
        http.get('http://localhost:3333/logements', ({ request }) => {
          const url = new URL(request.url)
          const city = url.searchParams.get('city')
          
          return HttpResponse.json({
            success: true,
            data: {
              properties: [
                {
                  id: 'log-1',
                  title: 'Maison à ' + city,
                  city: city,
                  pricePerNight: 10000
                },
                {
                  id: 'log-2',
                  title: 'Appartement à ' + city,
                  city: city,
                  pricePerNight: 15000
                }
              ],
              total: 2
            }
          })
        })
      )

      const results = await LogementService.getAllProperties({
        city: 'Dakar'
      })

      expect(results.properties.length).toBe(2)
      expect(results.properties[0].city).toBe('Dakar')
      expect(results.total).toBe(2)
    })

    it('devrait rechercher avec plusieurs critères', async () => {
      server.use(
        http.get('http://localhost:3333/logements', ({ request }) => {
          const url = new URL(request.url)
          const city = url.searchParams.get('city')
          const priceMin = url.searchParams.get('priceMin')
          const priceMax = url.searchParams.get('priceMax')
          
          return HttpResponse.json({
            success: true,
            data: {
              properties: [
                {
                  id: 'log-1',
                  title: 'Logement filtré',
                  city: city,
                  pricePerNight: parseInt(priceMin || '0') + 1000
                }
              ],
              total: 1
            }
          })
        })
      )

      const results = await LogementService.getAllProperties({
        city: 'Dakar',
        priceMin: 5000,
        priceMax: 20000,
        startDate: '2024-02-01',
        endDate: '2024-02-05'
      })

      expect(results.properties.length).toBe(1)
    })
  })

  describe('Recherche avec filtres avancés', () => {
    it('devrait appliquer les filtres et mettre à jour les résultats', async () => {
      server.use(
        http.get('http://localhost:3333/logements', ({ request }) => {
          const url = new URL(request.url)
          const priceMin = url.searchParams.get('priceMin')
          const priceMax = url.searchParams.get('priceMax')
          const type = url.searchParams.get('type')
          
          return HttpResponse.json({
            success: true,
            data: {
              properties: [
                {
                  id: 'log-filtered',
                  title: 'Logement filtré',
                  type: type,
                  pricePerNight: parseInt(priceMin || '0')
                }
              ],
              total: 1
            }
          })
        })
      )

      const wrapper = mount(FilterSidebar, {
        global: {
          plugins: [pinia]
        }
      })

      // Simule l'application de filtres via le composable
      const { loadProperties, properties } = useLogements()
      
      await loadProperties({
        priceMin: 50,
        priceMax: 200,
        type: 'maison'
      })

      await nextTick()

      expect(properties.value.length).toBeGreaterThan(0)
    })

    it('devrait filtrer par type de logement', async () => {
      server.use(
        http.get('http://localhost:3333/logements', ({ request }) => {
          const url = new URL(request.url)
          const type = url.searchParams.get('type')
          
          return HttpResponse.json({
            success: true,
            data: {
              properties: [
                {
                  id: 'log-1',
                  title: 'Maison',
                  type: type
                }
              ],
              total: 1
            }
          })
        })
      )

      const results = await LogementService.getAllProperties({
        type: 'maison'
      })

      expect(results.properties[0].type).toBe('maison')
    })

    it('devrait filtrer par nombre de voyageurs', async () => {
      server.use(
        http.get('http://localhost:3333/logements', ({ request }) => {
          const url = new URL(request.url)
          const guests = url.searchParams.get('guests')
          
          return HttpResponse.json({
            success: true,
            data: {
              properties: [
                {
                  id: 'log-1',
                  title: 'Logement pour ' + guests + ' personnes',
                  capacity: parseInt(guests || '1')
                }
              ],
              total: 1
            }
          })
        })
      )

      const results = await LogementService.getAllProperties({
        guests: 4
      })

      expect(results.properties[0].capacity).toBe(4)
    })
  })

  describe('Recherche géolocalisée', () => {
    it('devrait rechercher par coordonnées GPS', async () => {
      server.use(
        http.get('http://localhost:3333/logements', ({ request }) => {
          const url = new URL(request.url)
          const latitude = url.searchParams.get('latitude')
          const longitude = url.searchParams.get('longitude')
          const radius = url.searchParams.get('radius')
          
          return HttpResponse.json({
            success: true,
            data: {
              properties: [
                {
                  id: 'log-nearby',
                  title: 'Logement proche',
                  latitude: parseFloat(latitude || '0'),
                  longitude: parseFloat(longitude || '0')
                }
              ],
              total: 1
            }
          })
        })
      )

      const results = await LogementService.getAllProperties({
        latitude: 14.7167,
        longitude: -17.4677,
        radius: 5 // 5 km
      })

      expect(results.properties.length).toBe(1)
      expect(results.properties[0].latitude).toBe(14.7167)
    })
  })

  describe('Tri et pagination', () => {
    it('devrait trier les résultats par prix croissant', async () => {
      server.use(
        http.get('http://localhost:3333/logements', ({ request }) => {
          const url = new URL(request.url)
          const sortBy = url.searchParams.get('sortBy')
          
          const logements = [
            { id: 'log-1', pricePerNight: 10000 },
            { id: 'log-2', pricePerNight: 5000 },
            { id: 'log-3', pricePerNight: 15000 }
          ]
          
          if (sortBy === 'price_asc') {
            logements.sort((a, b) => a.pricePerNight - b.pricePerNight)
          }
          
          return HttpResponse.json({
            success: true,
            data: {
              logements,
              total: 3
            }
          })
        })
      )

      const results = await LogementService.getAllProperties({
        sortBy: 'price_asc'
      })

      expect(results.properties[0].pricePerNight).toBe(5000)
      expect(results.properties[1].pricePerNight).toBe(10000)
      expect(results.properties[2].pricePerNight).toBe(15000)
    })

    it('devrait gérer la pagination', async () => {
      server.use(
        http.get('http://localhost:3333/logements', ({ request }) => {
          const url = new URL(request.url)
          const page = parseInt(url.searchParams.get('page') || '1')
          const limit = parseInt(url.searchParams.get('limit') || '20')
          
          const allLogements = Array.from({ length: 50 }, (_, i) => ({
            id: `log-${i + 1}`,
            title: `Logement ${i + 1}`
          }))
          
          const start = (page - 1) * limit
          const end = start + limit
          
          return HttpResponse.json({
            success: true,
            data: {
              logements: allLogements.slice(start, end),
              total: 50,
              page,
              limit,
              totalPages: Math.ceil(50 / limit)
            }
          })
        })
      )

      const page1 = await LogementService.getAllProperties({
        page: 1,
        limit: 10
      })

      expect(page1.properties.length).toBe(10)
      expect(page1.total).toBe(50)

      const page2 = await LogementService.getAllProperties({
        page: 2,
        limit: 10
      })

      expect(page2.properties.length).toBe(10)
      expect(page2.properties[0].id).toBe('log-11')
    })
  })

  describe('Recherche avec dates', () => {
    it('devrait filtrer les logements disponibles pour des dates spécifiques', async () => {
      server.use(
        http.get('http://localhost:3333/logements', ({ request }) => {
          const url = new URL(request.url)
          const startDate = url.searchParams.get('startDate')
          const endDate = url.searchParams.get('endDate')
          
          return HttpResponse.json({
            success: true,
            data: {
              properties: [
                {
                  id: 'log-available',
                  title: 'Logement disponible',
                  availableDates: {
                    start: startDate,
                    end: endDate
                  }
                }
              ],
              total: 1
            }
          })
        })
      )

      const results = await LogementService.getAllProperties({
        startDate: '2024-02-01',
        endDate: '2024-02-05'
      })

      expect(results.properties.length).toBe(1)
    })
  })
})

