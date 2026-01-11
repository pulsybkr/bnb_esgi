/**
 * Tests d'intégration pour la gestion des logements
 * Teste le flux complet : Composant → Composable → Service → API + Cloudinary
 */

import { describe, it, expect, beforeEach, vi } from 'vitest'
import { mount } from '@vue/test-utils'
import { createPinia, setActivePinia } from 'pinia'
import { nextTick } from 'vue'
import { http, HttpResponse } from 'msw'
import { server } from '../mocks/server'
import PropertyStepPhotos from '@/components/property/PropertyStepPhotos.vue'
import { usePropertyCreation } from '@/composables/usePropertyCreation'
import { useAuthStore } from '@/stores/auth'
import { LogementService } from '@/services/logement/logement.service'
import { CloudinaryService } from '@/services/cloudinary/cloudinary.service'

// Mock XMLHttpRequest pour Cloudinary
const mockXHR = {
  upload: {
    addEventListener: vi.fn()
  },
  addEventListener: vi.fn(),
  open: vi.fn(),
  send: vi.fn(),
  status: 200,
  responseText: JSON.stringify({
    public_id: 'test-image-123',
    secure_url: 'https://res.cloudinary.com/test/image/upload/test-image-123.jpg',
    url: 'https://res.cloudinary.com/test/image/upload/test-image-123.jpg',
    width: 1920,
    height: 1080,
    format: 'jpg',
    resource_type: 'image',
    created_at: new Date().toISOString(),
    bytes: 500000
  })
}

global.XMLHttpRequest = vi.fn(() => mockXHR as any) as any

describe('Intégration - Gestion des logements', () => {
  let pinia: ReturnType<typeof createPinia>
  let authStore: ReturnType<typeof useAuthStore>

  beforeEach(() => {
    pinia = createPinia()
    setActivePinia(pinia)
    authStore = useAuthStore()
    authStore.setUser({
      id: 'owner-123',
      email: 'owner@example.com',
      firstName: 'Owner',
      lastName: 'User',
      userType: 'proprietaire',
      emailVerified: true,
      phoneVerified: false,
      status: 'active',
      registrationDate: new Date().toISOString()
    })
    authStore.setTokens('mock-token', 'mock-refresh')
    
    // Reset mocks
    vi.clearAllMocks()
  })

  describe('Upload de photos', () => {
    it('devrait uploader une photo : composant → service Cloudinary → mise à jour état', async () => {
      const wrapper = mount(PropertyStepPhotos, {
        global: {
          plugins: [pinia]
        }
      })

      // Crée un fichier de test
      const file = new File(['fake-image-content'], 'test-photo.jpg', {
        type: 'image/jpeg'
      })

      // Mock de l'upload Cloudinary
      vi.spyOn(CloudinaryService, 'uploadImage').mockResolvedValue({
        public_id: 'test-image-123',
        secure_url: 'https://res.cloudinary.com/test/image/upload/test-image-123.jpg',
        url: 'https://res.cloudinary.com/test/image/upload/test-image-123.jpg',
        width: 1920,
        height: 1080,
        format: 'jpg',
        resource_type: 'image',
        created_at: new Date().toISOString(),
        bytes: 500000
      })

      const { uploadMultiplePhotos, formData } = usePropertyCreation()
      
      await uploadMultiplePhotos([file])

      await nextTick()

      expect(formData.value.photos.length).toBe(1)
      expect(formData.value.photos[0].public_id).toBe('test-image-123')
      expect(formData.value.photos[0].secure_url).toContain('cloudinary.com')
    })

    it('devrait uploader plusieurs photos en parallèle', async () => {
      const files = [
        new File(['content1'], 'photo1.jpg', { type: 'image/jpeg' }),
        new File(['content2'], 'photo2.jpg', { type: 'image/jpeg' }),
        new File(['content3'], 'photo3.jpg', { type: 'image/jpeg' })
      ]

      const uploadResults = files.map((file, index) => ({
        public_id: `test-image-${index}`,
        secure_url: `https://res.cloudinary.com/test/image/upload/test-image-${index}.jpg`,
        url: `https://res.cloudinary.com/test/image/upload/test-image-${index}.jpg`,
        width: 1920,
        height: 1080,
        format: 'jpg',
        resource_type: 'image',
        created_at: new Date().toISOString(),
        bytes: 500000
      }))

      vi.spyOn(CloudinaryService, 'uploadMultipleImages').mockResolvedValue(uploadResults)

      const { uploadMultiplePhotos, formData } = usePropertyCreation()
      await uploadMultiplePhotos(files)

      await nextTick()

      expect(formData.value.photos.length).toBe(3)
      expect(formData.value.photos[0].public_id).toBe('test-image-0')
      expect(formData.value.photos[1].public_id).toBe('test-image-1')
      expect(formData.value.photos[2].public_id).toBe('test-image-2')
    })

    it('devrait gérer les erreurs d\'upload', async () => {
      const file = new File(['content'], 'test.jpg', { type: 'image/jpeg' })

      vi.spyOn(CloudinaryService, 'uploadImage').mockRejectedValue(
        new Error('Erreur lors de l\'upload')
      )

      const { uploadMultiplePhotos } = usePropertyCreation()
      
      await expect(uploadMultiplePhotos([file])).rejects.toThrow('Erreur lors de l\'upload')
    })

    it('devrait valider la taille et le type de fichier', async () => {
      // Fichier trop volumineux
      const largeFile = new File(
        new Array(11 * 1024 * 1024).fill('a'),
        'large.jpg',
        { type: 'image/jpeg' }
      )

      await expect(
        CloudinaryService.uploadImage(largeFile)
      ).rejects.toThrow('La taille de l\'image ne doit pas dépasser 10MB')

      // Fichier non-image
      const pdfFile = new File(['content'], 'document.pdf', { type: 'application/pdf' })

      await expect(
        CloudinaryService.uploadImage(pdfFile)
      ).rejects.toThrow('Le fichier doit être une image')
    })

    it('devrait définir une photo principale et mettre à jour l\'UI', async () => {
      const wrapper = mount(PropertyStepPhotos, {
        global: {
          plugins: [pinia]
        }
      })

      const { formData, setMainPhoto } = usePropertyCreation()
      
      // Simule des photos déjà uploadées
      formData.photos = [
        { public_id: 'photo-1', secure_url: 'url1' } as any,
        { public_id: 'photo-2', secure_url: 'url2' } as any,
        { public_id: 'photo-3', secure_url: 'url3' } as any
      ]

      await nextTick()

      setMainPhoto(1) // Définit la photo à l'index 1 comme principale

      await nextTick()

      expect(formData.mainPhotoIndex).toBe(1)
    })

    it('devrait supprimer une photo et mettre à jour l\'état', async () => {
      const { formData, removePhoto } = usePropertyCreation()
      
      formData.photos = [
        { public_id: 'photo-1', secure_url: 'url1' } as any,
        { public_id: 'photo-2', secure_url: 'url2' } as any,
        { public_id: 'photo-3', secure_url: 'url3' } as any
      ]

      removePhoto(0)

      await nextTick()

      expect(formData.photos.length).toBe(2)
      expect(formData.photos[0].public_id).toBe('photo-2')
    })
  })

  describe('Création de logement complète', () => {
    it('devrait créer un logement avec toutes les données : composable → service → API', async () => {
      server.use(
        http.post('http://localhost:3333/logements', async ({ request }) => {
          const body = await request.json() as any
          return HttpResponse.json({
            success: true,
            data: {
              property: {
                id: 'log-new-123',
                title: body.title,
                description: body.description,
                type: body.type,
                address: body.address,
                city: body.city,
                country: body.country,
                pricePerNight: body.pricePerNight,
                capacity: body.capacity,
                roomCount: body.roomCount,
                photos: body.photos,
                status: 'actif',
                ownerId: 'owner-123',
                createdAt: new Date().toISOString()
              }
            }
          })
        })
      )

      const { formData, submitProperty } = usePropertyCreation()
      
      // Remplit les données du formulaire
      formData.title = 'Belle maison à Dakar'
      formData.description = 'Une magnifique maison avec vue sur la mer'
      formData.type = 'maison'
      formData.address = '123 Rue de la Corniche'
      formData.city = 'Dakar'
      formData.country = 'Sénégal'
      formData.pricePerNight = 15000
      formData.capacity = 4
      formData.roomCount = 2
      formData.photos = [
        { public_id: 'photo-1', secure_url: 'url1' } as any,
        { public_id: 'photo-2', secure_url: 'url2' } as any
      ]
      formData.mainPhotoIndex = 0

      const result = await submitProperty()

      await nextTick()

      expect(result).toBeTruthy()
      expect(result).toBe('log-new-123')
    })

    it('devrait valider les données avant la soumission', async () => {
      const { formData, stepValidations, validateBasicInfo } = usePropertyCreation()
      
      // Données invalides
      formData.title = 'A' // Trop court
      formData.description = 'Court' // Trop court
      formData.type = ''

      const validation = validateBasicInfo()

      expect(validation.isValid).toBe(false)
      expect(validation.errors.title).toBeTruthy()
      expect(validation.errors.description).toBeTruthy()
      expect(validation.errors.type).toBeTruthy()
    })
  })

  describe('Mise à jour de logement', () => {
    it('devrait mettre à jour un logement existant', async () => {
      server.use(
        http.put('http://localhost:3333/logements/log-123', async ({ request }) => {
          const body = await request.json() as any
          return HttpResponse.json({
            success: true,
            data: {
              property: {
                id: 'log-123',
                title: body.title || 'Maison mise à jour',
                pricePerNight: body.pricePerNight || 20000,
                updatedAt: new Date().toISOString()
              }
            }
          })
        })
      )

      const updated = await LogementService.updateProperty('log-123', {
        title: 'Maison mise à jour',
        pricePerNight: 20000
      })

      expect(updated).toBeTruthy()
      expect(updated.title).toBe('Maison mise à jour')
      expect(updated.pricePerNight).toBe(20000)
    })
  })

  describe('Récupération des logements', () => {
    it('devrait charger les logements du propriétaire', async () => {
      server.use(
        http.get('http://localhost:3333/logements/my', () => {
          return HttpResponse.json({
            success: true,
            data: {
              properties: [
                {
                  id: 'log-1',
                  title: 'Maison 1',
                  status: 'actif'
                },
                {
                  id: 'log-2',
                  title: 'Maison 2',
                  status: 'actif'
                }
              ]
            }
          })
        })
      )

      const logements = await LogementService.getMyProperties()

      expect(logements.length).toBe(2)
      expect(logements[0].id).toBe('log-1')
    })
  })
})

