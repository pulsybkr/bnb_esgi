import type { Service } from '@/types/accommodation'

export const availableServices: Service[] = [
  {
    id: 'cleaning',
    name: 'Nettoyage',
    description: 'Service de nettoyage en fin de séjour',
    price: 50,
    priceType: 'fixed',
  },
  {
    id: 'breakfast',
    name: 'Petit-déjeuner',
    description: 'Petit-déjeuner servi chaque matin',
    price: 15,
    priceType: 'per_guest_per_night',
  },
  {
    id: 'airport_transfer',
    name: 'Transfert aéroport',
    description: 'Transfert aller-retour depuis l\'aéroport',
    price: 60,
    priceType: 'fixed',
  },
  {
    id: 'concierge',
    name: 'Service de conciergerie',
    description: 'Assistance pour réservations et recommandations',
    price: 25,
    priceType: 'per_night',
  },
  {
    id: 'baby_equipment',
    name: 'Équipement bébé',
    description: 'Lit bébé, chaise haute, etc.',
    price: 10,
    priceType: 'per_night',
  },
  {
    id: 'late_checkout',
    name: 'Check-out tardif',
    description: 'Départ jusqu\'à 18h (sous réserve de disponibilité)',
    price: 30,
    priceType: 'fixed',
  },
  {
    id: 'early_checkin',
    name: 'Check-in anticipé',
    description: 'Arrivée dès 12h (sous réserve de disponibilité)',
    price: 30,
    priceType: 'fixed',
  },
  {
    id: 'parking',
    name: 'Parking privé',
    description: 'Place de parking sécurisée',
    price: 10,
    priceType: 'per_night',
  },
  {
    id: 'pet_fee',
    name: 'Animaux de compagnie',
    description: 'Supplément pour animaux (max 2)',
    price: 20,
    priceType: 'per_night',
  },
  {
    id: 'bike_rental',
    name: 'Location de vélos',
    description: 'Location de vélos pour la durée du séjour',
    price: 15,
    priceType: 'per_night',
  },
]

/**
 * Calcule le prix d'un service en fonction de son type et du contexte
 */
export function calculateServicePrice(
  service: Service,
  nights: number,
  guests: number
): number {
  switch (service.priceType) {
    case 'fixed':
      return service.price
    case 'per_night':
      return service.price * nights
    case 'per_guest':
      return service.price * guests
    case 'per_guest_per_night':
      return service.price * guests * nights
    default:
      return service.price
  }
}

/**
 * Calcule le prix total de plusieurs services
 */
export function calculateTotalServicesPrice(
  services: Service[],
  selectedServices: SelectedService[],
  nights: number,
  guests: number
): number {
  let total = 0

  selectedServices.forEach(selected => {
    const service = services.find(s => s.id === selected.serviceId)
    if (service) {
      const quantity = selected.quantity || 1
      const price = calculateServicePrice(service, nights, guests)
      total += price * quantity
    }
  })

  return total
}
