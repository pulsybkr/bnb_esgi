/**
 * Utilitaires pour générer des recommandations de logements
 */

import type { Accommodation } from '@/types/accommodation'
import { findPopularAccommodations } from './accommodationSimilarity'

export interface UserPreferences {
  preferredCities?: string[]
  priceRange?: [number, number]
  propertyTypes?: string[]
  preferredAmenities?: string[]
  maxGuests?: number
  preferredTags?: string[]
}

export type RecommendationType = 'personalized' | 'trending' | 'new' | 'value' | 'basic' | 'budget' | 'top-rated' | 'superhost' | 'balanced'

/**
 * Calcule un score de recommandation personnalisée basé sur les préférences utilisateur
 */
function calculatePersonalizedScore(
  accommodation: Accommodation,
  preferences?: UserPreferences
): number {
  if (!preferences) return 0

  let score = 0
  let factors = 0

  // Préférence de ville (poids: 30%)
  if (preferences.preferredCities && preferences.preferredCities.length > 0) {
    if (preferences.preferredCities.includes(accommodation.location.city)) {
      score += 30
    }
    factors += 30
  }

  // Fourchette de prix (poids: 25%)
  if (preferences.priceRange) {
    const [minPrice, maxPrice] = preferences.priceRange
    if (accommodation.price >= minPrice && accommodation.price <= maxPrice) {
      score += 25
    } else {
      // Score partiel si proche de la fourchette
      const distanceFromRange = accommodation.price < minPrice
        ? minPrice - accommodation.price
        : accommodation.price - maxPrice
      const maxDistance = maxPrice - minPrice
      const partialScore = Math.max(0, 25 - (distanceFromRange / maxDistance) * 25)
      score += partialScore
    }
    factors += 25
  }

  // Type de propriété (poids: 20%)
  if (preferences.propertyTypes && preferences.propertyTypes.length > 0) {
    if (preferences.propertyTypes.includes(accommodation.propertyType)) {
      score += 20
    }
    factors += 20
  }

  // Équipements préférés (poids: 15%)
  if (preferences.preferredAmenities && preferences.preferredAmenities.length > 0) {
    const matchingAmenities = accommodation.amenities.filter(amenity =>
      preferences.preferredAmenities!.includes(amenity)
    )
    const amenityScore = (matchingAmenities.length / preferences.preferredAmenities.length) * 15
    score += amenityScore
    factors += 15
  }

  // Tags préférés (poids: 10%)
  if (preferences.preferredTags && preferences.preferredTags.length > 0 && accommodation.tags) {
    const matchingTags = accommodation.tags.filter(tag =>
      preferences.preferredTags!.includes(tag)
    )
    const tagScore = (matchingTags.length / preferences.preferredTags.length) * 10
    score += tagScore
    factors += 10
  }

  return factors > 0 ? (score / factors) * 100 : 0
}

/**
 * Obtient les recommandations de logements
 */
export function getRecommendedAccommodations(
  allAccommodations: Accommodation[],
  userPreferences?: UserPreferences,
  excludeIds: string[] = [],
  maxResults: number = 6,
  recommendationType: RecommendationType = 'personalized'
): Accommodation[] {
  // Exclure les logements spécifiés
  let filtered = allAccommodations.filter(
    acc => !excludeIds.includes(acc.id)
  )

  switch (recommendationType) {
    case 'personalized':
      return getPersonalizedRecommendations(filtered, userPreferences, maxResults)

    case 'trending':
      return getTrendingRecommendations(filtered, maxResults)

    case 'new':
      return getNewRecommendations(filtered, maxResults)

    case 'value':
      return getValueRecommendations(filtered, maxResults)

    default:
      return getPersonalizedRecommendations(filtered, userPreferences, maxResults)
  }
}

/**
 * Recommandations personnalisées basées sur les préférences utilisateur
 */
function getPersonalizedRecommendations(
  accommodations: Accommodation[],
  preferences?: UserPreferences,
  maxResults: number = 6
): Accommodation[] {
  if (!preferences) {
    // Si pas de préférences, retourner les plus populaires
    return getTrendingRecommendations(accommodations, maxResults)
  }

  // Calculer les scores pour chaque logement
  const withScores = accommodations.map(acc => ({
    accommodation: acc,
    score: calculatePersonalizedScore(acc, preferences)
  }))

  // Trier par score décroissant et prendre les meilleurs
  return withScores
    .sort((a, b) => b.score - a.score)
    .slice(0, maxResults)
    .map(item => item.accommodation)
}

/**
 * Recommandations trending (les plus populaires)
 */
function getTrendingRecommendations(
  accommodations: Accommodation[],
  maxResults: number = 6
): Accommodation[] {
  // Utiliser la fonction existante pour trouver les logements populaires
  return findPopularAccommodations(accommodations, undefined, undefined, maxResults)
}

/**
 * Recommandations de nouveaux logements
 */
function getNewRecommendations(
  accommodations: Accommodation[],
  maxResults: number = 6
): Accommodation[] {
  // Simuler des logements "nouveaux" en triant par ID (dans une vraie app, utiliser createdAt)
  // Pour la démo, on peut aussi utiliser ceux avec le moins d'avis
  return accommodations
    .sort((a, b) => b.id.localeCompare(a.id)) // Tri inversé par ID
    .slice(0, maxResults)
}

/**
 * Recommandations "meilleur rapport qualité-prix"
 */
function getValueRecommendations(
  accommodations: Accommodation[],
  maxResults: number = 6
): Accommodation[] {
  // Calculer un score valeur = (rating * reviewCount) / price
  const withValueScore = accommodations.map(acc => {
    const valueScore = (acc.rating * Math.log(acc.reviewCount + 1)) / acc.price
    return {
      accommodation: acc,
      valueScore
    }
  })

  // Trier par score valeur décroissant
  return withValueScore
    .sort((a, b) => b.valueScore - a.valueScore)
    .slice(0, maxResults)
    .map(item => item.accommodation)
}

/**
 * Génère des préférences utilisateur à partir de l'historique de recherche
 */
export function generatePreferencesFromHistory(
  searchHistory: string[],
  viewedAccommodations: Accommodation[]
): UserPreferences {
  const preferences: UserPreferences = {}

  // Analyser les villes dans l'historique de recherche
  const cities = new Map<string, number>()
  searchHistory.forEach(query => {
    // Extraire les villes potentielles (simplifié)
    viewedAccommodations.forEach(acc => {
      if (query.toLowerCase().includes(acc.location.city.toLowerCase())) {
        cities.set(acc.location.city, (cities.get(acc.location.city) || 0) + 1)
      }
    })
  })

  if (cities.size > 0) {
    preferences.preferredCities = Array.from(cities.entries())
      .sort((a, b) => b[1] - a[1])
      .slice(0, 3)
      .map(([city]) => city)
  }

  // Analyser les prix des logements consultés
  if (viewedAccommodations.length > 0) {
    const prices = viewedAccommodations.map(acc => acc.price).sort((a, b) => a - b)
    const minPrice = Math.max(0, prices[0] - 20)
    const maxPrice = prices[prices.length - 1] + 20
    preferences.priceRange = [minPrice, maxPrice]
  }

  // Analyser les types de propriétés consultés
  const propertyTypes = new Map<string, number>()
  viewedAccommodations.forEach(acc => {
    propertyTypes.set(acc.propertyType, (propertyTypes.get(acc.propertyType) || 0) + 1)
  })

  if (propertyTypes.size > 0) {
    preferences.propertyTypes = Array.from(propertyTypes.entries())
      .sort((a, b) => b[1] - a[1])
      .slice(0, 2)
      .map(([type]) => type)
  }

  // Analyser les équipements les plus fréquents
  const amenities = new Map<string, number>()
  viewedAccommodations.forEach(acc => {
    acc.amenities.forEach(amenity => {
      amenities.set(amenity, (amenities.get(amenity) || 0) + 1)
    })
  })

  if (amenities.size > 0) {
    preferences.preferredAmenities = Array.from(amenities.entries())
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5)
      .map(([amenity]) => amenity)
  }

  return preferences
}

