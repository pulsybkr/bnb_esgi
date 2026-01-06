/**
 * Utilitaires pour mapper les filtres frontend vers le backend
 */

import type { PropertyFilters } from '@/types/logement'

/**
 * Mappe les types de propriété frontend vers backend
 */
export function mapPropertyTypeToBackend(frontendType: string): 'maison' | 'appartement' | 'chambre' | 'hotel' | undefined {
    const typeMap: Record<string, 'maison' | 'appartement' | 'chambre' | 'hotel'> = {
        'apartment': 'appartement',
        'house': 'maison',
        'villa': 'maison',
        'studio': 'chambre',
        'loft': 'appartement'
    }

    return typeMap[frontendType]
}

/**
 * Mappe le tri frontend vers backend
 */
export function mapSortToBackend(frontendSort: string): {
    sortBy: 'createdAt' | 'pricePerNight' | 'averageRating' | 'title'
    sortOrder: 'asc' | 'desc'
} {
    const sortMap: Record<string, { sortBy: 'createdAt' | 'pricePerNight' | 'averageRating' | 'title', sortOrder: 'asc' | 'desc' }> = {
        'price-asc': { sortBy: 'pricePerNight', sortOrder: 'asc' },
        'price-desc': { sortBy: 'pricePerNight', sortOrder: 'desc' },
        'rating-desc': { sortBy: 'averageRating', sortOrder: 'desc' },
        'title-asc': { sortBy: 'title', sortOrder: 'asc' }
    }

    return sortMap[frontendSort] || { sortBy: 'createdAt', sortOrder: 'desc' }
}

/**
 * Construit les filtres backend à partir des filtres frontend
 */
export function buildBackendFilters(options: {
    searchQuery?: string
    priceRange?: [number, number]
    propertyTypes?: string[]
    maxGuests?: number
    page?: number
    limit?: number
    sortBy?: string
}): PropertyFilters {
    const filters: PropertyFilters = {
        status: 'actif'
    }

    // Recherche textuelle (ville)
    if (options.searchQuery && options.searchQuery.trim()) {
        filters.city = options.searchQuery.trim()
    }

    // Filtres de prix
    if (options.priceRange) {
        if (options.priceRange[0] > 0) {
            filters.minPrice = options.priceRange[0]
        }
        if (options.priceRange[1] < 1000000) {
            filters.maxPrice = options.priceRange[1]
        }
    }

    // Type de propriété (on prend le premier pour l'instant)
    if (options.propertyTypes && options.propertyTypes.length > 0) {
        const backendType = mapPropertyTypeToBackend(options.propertyTypes[0])
        if (backendType) {
            filters.type = backendType
        }
    }

    // Capacité minimale
    if (options.maxGuests && options.maxGuests > 0) {
        filters.minCapacity = options.maxGuests
    }

    // Pagination
    filters.page = options.page || 1
    filters.limit = options.limit || 20

    // Tri
    if (options.sortBy) {
        const { sortBy, sortOrder } = mapSortToBackend(options.sortBy)
        filters.sortBy = sortBy
        filters.sortOrder = sortOrder
    }

    return filters
}
