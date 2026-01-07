export enum PropertyType {
  APARTMENT = 'apartment',
  HOUSE = 'house',
  VILLA = 'villa',
  STUDIO = 'studio',
  LOFT = 'loft'
}

export interface PropertyTypeOption {
  value: PropertyType
  label: string
}

export const PROPERTY_TYPE_OPTIONS: PropertyTypeOption[] = [
  { value: PropertyType.APARTMENT, label: 'Appartement' },
  { value: PropertyType.HOUSE, label: 'Maison' },
  { value: PropertyType.VILLA, label: 'Villa' },
  { value: PropertyType.STUDIO, label: 'Studio' },
  { value: PropertyType.LOFT, label: 'Loft' }
]

export interface Accommodation {
  id: string
  title: string
  description: string
  price: number // Prix de base par nuit
  location: {
    city: string
    country: string
    address: string
    coordinates?: {
      latitude: number
      longitude: number
    }
  }
  images: string[]
  amenities: string[]
  maxGuests: number
  bedrooms: number
  bathrooms: number
  rating: number
  reviewCount: number
  host: {
    name: string
    avatar: string
    isSuperhost: boolean
  }
  propertyType: PropertyType
  availability: {
    checkIn: string
    checkOut: string
  }
  services?: Service[]
  tags?: string[]
  pricingConfigId?: string // ID de la configuration de tarification (optionnel)
  status?: 'actif' | 'suspendu' | 'archive' // Statut du logement
}

export interface Service {
  id: string
  name: string
  description?: string
  price: number
  priceType: 'fixed' | 'per_night' | 'per_guest' | 'per_guest_per_night'
  icon?: string
}

export interface SelectedService {
  serviceId: string
  quantity?: number // Pour les services qui peuvent être commandés plusieurs fois
}

export interface FilterOptions {
  priceRange: [number, number]
  propertyType: string[]
  amenities: string[]
  tags: string[]
  maxGuests: number
  bedrooms: number
  bathrooms: number
  locationRadius?: {
    center: {
      latitude: number
      longitude: number
    }
    radiusKm: number
  }
}

