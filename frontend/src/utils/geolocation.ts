/**
 * Utilitaires pour la géolocalisation et le calcul de distances
 */

export interface Coordinates {
  latitude: number
  longitude: number
}

/**
 * Calcule la distance entre deux points en kilomètres (formule de Haversine)
 */
export function calculateDistance(
  point1: Coordinates,
  point2: Coordinates
): number {
  const R = 6371 // Rayon de la Terre en kilomètres
  const dLat = toRadians(point2.latitude - point1.latitude)
  const dLon = toRadians(point2.longitude - point1.longitude)
  
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(toRadians(point1.latitude)) *
      Math.cos(toRadians(point2.latitude)) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2)
  
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))
  const distance = R * c
  
  return Math.round(distance * 10) / 10 // Arrondir à 1 décimale
}

/**
 * Convertit les degrés en radians
 */
function toRadians(degrees: number): number {
  return degrees * (Math.PI / 180)
}

/**
 * Vérifie si un point est dans un rayon donné d'un point central
 */
export function isWithinRadius(
  point: Coordinates,
  center: Coordinates,
  radiusKm: number
): boolean {
  const distance = calculateDistance(point, center)
  return distance <= radiusKm
}

/**
 * Trouve tous les points dans un rayon donné d'un point central
 */
export function findPointsInRadius<T extends { coordinates?: Coordinates }>(
  items: T[],
  center: Coordinates,
  radiusKm: number
): Array<T & { distance: number }> {
  return items
    .filter(item => item.coordinates)
    .map(item => ({
      ...item,
      distance: calculateDistance(item.coordinates!, center)
    }))
    .filter(item => item.distance <= radiusKm)
    .sort((a, b) => a.distance - b.distance)
}

/**
 * Obtient la position de l'utilisateur via le navigateur
 */
export function getUserLocation(): Promise<Coordinates> {
  return new Promise((resolve, reject) => {
    if (!navigator.geolocation) {
      reject(new Error('La géolocalisation n\'est pas supportée par votre navigateur'))
      return
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        resolve({
          latitude: position.coords.latitude,
          longitude: position.coords.longitude
        })
      },
      (error) => {
        reject(error)
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 0
      }
    )
  })
}

/**
 * Convertit une adresse en coordonnées GPS (géocodage)
 * Note: Dans une vraie app, utiliser un service de géocodage comme Google Maps API
 */
export async function geocodeAddress(address: string): Promise<Coordinates | null> {
  // Simulation pour la démo
  // Dans une vraie app, appeler une API de géocodage
  const cityCoordinates: Record<string, Coordinates> = {
    'Paris': { latitude: 48.8566, longitude: 2.3522 },
    'Nice': { latitude: 43.7102, longitude: 7.2620 },
    'Lyon': { latitude: 45.7640, longitude: 4.8357 },
    'Marseille': { latitude: 43.2965, longitude: 5.3698 },
    'Bordeaux': { latitude: 44.8378, longitude: -0.5792 },
  }

  for (const [city, coords] of Object.entries(cityCoordinates)) {
    if (address.toLowerCase().includes(city.toLowerCase())) {
      return coords
    }
  }

  return null
}

/**
 * Formate la distance pour l'affichage
 */
export function formatDistance(km: number): string {
  if (km < 1) {
    return `${Math.round(km * 1000)}m`
  }
  return `${km.toFixed(1)}km`
}

