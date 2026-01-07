/**
 * Types pour les logements (synchronisés avec le backend)
 */

export type PropertyType = 'maison' | 'appartement' | 'chambre' | 'hotel'
export type PropertyStatus = 'actif' | 'suspendu' | 'archive'

export interface Photo {
    id: string
    url: string
    thumbnailUrl?: string
    isMain: boolean
    order: number
}

export interface Owner {
    id: string
    firstName: string
    lastName: string
    email?: string
    phone?: string
    profilePhoto?: string
    registrationDate?: Date
}

export interface Logement {
    id: string
    title: string
    description?: string
    address: string
    city: string
    country: string
    latitude?: number
    longitude?: number
    type: PropertyType
    roomCount: number
    capacity: number
    pricePerNight: number
    currency: string
    amenities?: any
    houseRules?: any
    status: PropertyStatus
    averageRating?: number
    owner: Owner
    photos: Photo[]
    createdAt: Date
    updatedAt: Date
    _count?: {
        reservations: number
        favorites: number
    }
}

export interface CreatePropertyData {
    title: string
    description?: string
    address: string
    city: string
    country: string
    latitude?: number
    longitude?: number
    type: PropertyType
    roomCount: number
    capacity: number
    pricePerNight: number
    currency?: string
    bookingMode?: 'instant' | 'request'
    amenities?: any
    houseRules?: any
    photos?: AddPhotoData[]
}

export interface UpdatePropertyData {
    title?: string
    description?: string
    address?: string
    city?: string
    country?: string
    latitude?: number
    longitude?: number
    type?: PropertyType
    roomCount?: number
    capacity?: number
    pricePerNight?: number
    currency?: string
    amenities?: any
    houseRules?: any
    status?: PropertyStatus
}

export interface PropertyFilters {
    city?: string
    country?: string
    type?: PropertyType
    minPrice?: number
    maxPrice?: number
    minCapacity?: number
    status?: PropertyStatus
    page?: number
    limit?: number
    sortBy?: 'createdAt' | 'pricePerNight' | 'averageRating' | 'title'
    sortOrder?: 'asc' | 'desc'
}

export interface AddPhotoData {
    url: string
    thumbnailUrl?: string
    isMain?: boolean
    order?: number
}

export interface PropertyStatistics {
    totalProperties: number
    activeProperties: number
    totalReservations: number
    totalFavorites: number
    averageRating: string
}
