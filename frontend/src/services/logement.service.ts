import apiClient from './api'
import type { Accommodation } from '@/types/accommodation'
import { PropertyType } from '@/types/accommodation'

export interface PropertyFilters {
  city?: string
  country?: string
  type?: 'maison' | 'appartement' | 'chambre' | 'hotel'
  minPrice?: number
  maxPrice?: number
  minCapacity?: number
  status?: 'actif' | 'suspendu' | 'archive'
  page?: number
  limit?: number
  sortBy?: 'createdAt' | 'pricePerNight' | 'averageRating' | 'title'
  sortOrder?: 'asc' | 'desc'
}

export interface PropertyListResponse {
  properties: Accommodation[]
  total: number
  page: number
  limit: number
  totalPages: number
}

export interface CreatePropertyData {
  title: string
  description?: string
  propertyType: string
  address: string
  city: string
  country: string
  maxGuests: number
  bedrooms: number
  bathrooms: number
  price: number
  amenities?: string[]
  tags?: string[]
  services?: string[]
  checkIn?: string
  checkOut?: string
  images?: File[]
  status?: 'actif' | 'suspendu' | 'archive'
}

/**
 * Transforme les données du backend (format Prisma) vers le format Accommodation
 */
export function transformBackendProperty(property: any): Accommodation {
  // Mapping des types de logement
  const typeMapping: Record<string, PropertyType> = {
    'appartement': PropertyType.APARTMENT,
    'maison': PropertyType.HOUSE,
    'villa': PropertyType.VILLA,
    'studio': PropertyType.STUDIO,
    'loft': PropertyType.LOFT,
    'chambre': PropertyType.APARTMENT, // Fallback
    'hotel': PropertyType.APARTMENT, // Fallback
  }

  // Extraire les équipements (amenities) depuis le JSON
  let amenities: string[] = []
  if (property.equipements) {
    if (typeof property.equipements === 'string') {
      try {
        amenities = Object.keys(JSON.parse(property.equipements)).filter(key =>
          JSON.parse(property.equipements)[key] === true
        )
      } catch {
        amenities = []
      }
    } else if (typeof property.equipements === 'object') {
      amenities = Object.keys(property.equipements).filter(key =>
        property.equipements[key] === true
      )
    }
  }

  // Extraire les tags
  let tags: string[] = []
  if (property.tags) {
    if (Array.isArray(property.tags)) {
      tags = property.tags
    } else if (typeof property.tags === 'string') {
      try {
        tags = JSON.parse(property.tags)
      } catch {
        tags = []
      }
    }
  }

  // Extraire les images depuis les photos
  // Construire l'URL complète si c'est un chemin relatif
  const getImageUrl = (url: string) => {
    if (!url) return ''
    // Si l'URL commence déjà par http, la retourner telle quelle
    if (url.startsWith('http://') || url.startsWith('https://')) {
      return url
    }
    // Sinon, construire l'URL complète avec le base URL de l'API
    const apiBaseUrl = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3333'
    return url.startsWith('/') ? `${apiBaseUrl}${url}` : `${apiBaseUrl}/${url}`
  }

  const images = property.photos && Array.isArray(property.photos)
    ? property.photos.map((photo: any) => {
      const url = photo.url || photo.url_miniature
      return url ? getImageUrl(url) : null
    }).filter(Boolean)
    : []

  // Extraire les coordonnées
  const coordinates = property.latitude && property.longitude
    ? {
      latitude: typeof property.latitude === 'string'
        ? parseFloat(property.latitude)
        : property.latitude.toNumber ? property.latitude.toNumber() : Number(property.latitude),
      longitude: typeof property.longitude === 'string'
        ? parseFloat(property.longitude)
        : property.longitude.toNumber ? property.longitude.toNumber() : Number(property.longitude),
    }
    : undefined

  // Extraire le prix
  const price = typeof property.prix_par_nuit === 'string'
    ? parseFloat(property.prix_par_nuit)
    : property.prix_par_nuit?.toNumber ? property.prix_par_nuit.toNumber() : Number(property.prix_par_nuit || property.pricePerNight || 0)

  // Nom du propriétaire
  const hostName = property.owner
    ? `${property.owner.prenom || property.owner.firstName || ''} ${property.owner.nom || property.owner.lastName || ''}`.trim()
    : 'Propriétaire'

  return {
    id: property.id,
    title: property.titre || property.title || '',
    description: property.description || '',
    price,
    location: {
      city: property.ville || property.city || '',
      country: property.pays || property.country || '',
      address: property.adresse || property.address || '',
      coordinates,
    },
    images,
    amenities,
    maxGuests: property.capacite_accueil || property.capacity || 0,
    bedrooms: property.nombre_chambres || property.bedrooms || 0,
    bathrooms: property.nombre_salles_bain || property.bathrooms || 0,
    rating: property.note_moyenne || property.averageRating || 0,
    reviewCount: property.nombre_avis || property.reviewCount || 0,
    host: {
      name: hostName,
      avatar: property.owner?.photo_profil || property.owner?.profilePhoto || '',
      isSuperhost: false, // TODO: Ajouter ce champ dans la base de données
    },
    propertyType: typeMapping[property.type] || PropertyType.APARTMENT,
    availability: {
      checkIn: property.heure_arrivee || property.checkIn || '15:00',
      checkOut: property.heure_depart || property.checkOut || '11:00',
      minNights: property.minNights || 1,
      maxNights: property.maxNights || 30,
    },

    tags,
    services: property.services?.map((service: any) => ({
      id: service.id,
      name: service.nom || service.name,
      description: service.description,
      price: typeof service.price === 'string'
        ? parseFloat(service.price)
        : service.price?.toNumber ? service.price.toNumber() : Number(service.price || 0),
      priceType: service.type_prix || service.priceType || 'fixed',
      icon: service.icone || service.icon,
    })) || [],
    pricing: {
      basePrice: price,
      cleaningFee: 0, // TODO: Fetch from backend if available
    },
    status: property.status || 'actif', // Statut du logement
  }
}


export const logementService = {
  /**
   * Récupère tous les logements avec filtres et pagination
   */
  async getAll(filters: PropertyFilters = {}): Promise<PropertyListResponse> {
    const response = await apiClient.get('/logements', { params: filters })
    const backendData = response.data.data

    // Transformer les propriétés
    const transformedProperties = backendData.properties.map(transformBackendProperty)

    return {
      properties: transformedProperties,
      total: backendData.total,
      page: backendData.page,
      limit: backendData.limit,
      totalPages: backendData.totalPages,
    }
  },

  /**
   * Récupère un logement par son ID
   */
  async getById(id: string): Promise<Accommodation> {
    const response = await apiClient.get(`/logements/${id}`)
    return transformBackendProperty(response.data.data.property)
  },

  /**
   * Crée un nouveau logement
   */
  async create(data: CreatePropertyData & { imagesInfo?: Array<{ index: number; isMain: boolean }> }): Promise<Accommodation> {
    const formData = new FormData()

    // Ajouter les images (Multer attend un champ nommé 'images' pour chaque fichier)
    if (data.images && data.images.length > 0) {
      data.images.forEach((file) => {
        formData.append('images', file)
      })
    }

    // Ajouter les informations sur les images (ordre et isMain)
    if (data.imagesInfo && data.imagesInfo.length > 0) {
      formData.append('imagesInfo', JSON.stringify(data.imagesInfo))
    }

    // Ajouter les autres données
    formData.append('title', data.title)
    if (data.description) formData.append('description', data.description)
    formData.append('propertyType', data.propertyType)
    formData.append('address', data.address)
    formData.append('city', data.city)
    formData.append('country', data.country)
    formData.append('maxGuests', data.maxGuests.toString())
    formData.append('bedrooms', data.bedrooms.toString())
    formData.append('bathrooms', data.bathrooms.toString())
    formData.append('price', data.price.toString())

    if (data.amenities) {
      formData.append('amenities', JSON.stringify(data.amenities))
    }

    if (data.tags) {
      formData.append('tags', JSON.stringify(data.tags))
    }

    if (data.services) {
      formData.append('services', JSON.stringify(data.services))
    }

    if (data.checkIn) formData.append('checkIn', data.checkIn)
    if (data.checkOut) formData.append('checkOut', data.checkOut)

    // Pour FormData, ne pas définir de headers, laisser axios gérer automatiquement
    const response = await apiClient.post('/logements', formData)
    return transformBackendProperty(response.data.data.property)
  },

  /**
   * Met à jour un logement
   */
  async update(id: string, data: Partial<CreatePropertyData>): Promise<Accommodation> {
    const response = await apiClient.put(`/logements/${id}`, data)
    return transformBackendProperty(response.data.data.property)
  },

  /**
   * Supprime un logement
   */
  async delete(id: string): Promise<void> {
    await apiClient.delete(`/logements/${id}`)
  },

  /**
   * Upload plusieurs images pour un logement
   */
  async uploadImages(id: string, images: File[]): Promise<any[]> {
    const formData = new FormData()
    images.forEach((file) => {
      formData.append('images', file)
    })

    // Pour FormData, ne pas définir de headers, laisser axios gérer automatiquement
    const response = await apiClient.post(`/logements/${id}/photos/upload`, formData)
    return response.data.data.photos
  },

  /**
   * Supprime une image d'un logement
   */
  async deleteImage(id: string, photoId: string): Promise<void> {
    await apiClient.delete(`/logements/${id}/photos/${photoId}`)
  },

  /**
   * Récupère les logements de l'utilisateur connecté
   */
  async getMyProperties(filters?: Partial<PropertyFilters>): Promise<Accommodation[]> {
    const response = await apiClient.get('/logements/my', { params: filters })
    return response.data.data.properties.map(transformBackendProperty)
  },
}

