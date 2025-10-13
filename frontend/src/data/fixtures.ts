import type { Accommodation } from '@/types/accommodation'

export const accommodations: Accommodation[] = [
  {
    id: '1',
    title: 'Magnifique appartement avec vue sur la Seine',
    description: 'Appartement moderne et élégant situé au cœur de Paris, avec une vue imprenable sur la Seine. Parfait pour découvrir la ville lumière.',
    price: 120,
    location: {
      city: 'Paris',
      country: 'France',
      address: '15 Quai de la Tournelle, 75005 Paris'
    },
    images: [
      'https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?w=800',
      'https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?w=800',
      'https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?w=800',
      'https://images.unsplash.com/photo-1560448204-603b3fc33ddc?w=800'
    ],
    amenities: ['WiFi', 'Cuisine équipée', 'Climatisation', 'Parking', 'Balcon'],
    maxGuests: 4,
    bedrooms: 2,
    bathrooms: 1,
    rating: 4.8,
    reviewCount: 127,
    host: {
      name: 'Marie Dubois',
      avatar: 'https://images.unsplash.com/photo-1494790108755-2616b612b786?w=100',
      isSuperhost: true
    },
    propertyType: 'apartment',
    availability: {
      checkIn: '15:00',
      checkOut: '11:00'
    }
  },
  {
    id: '2',
    title: 'Villa de luxe avec piscine privée',
    description: 'Villa exceptionnelle avec piscine privée, jardin paysager et vue panoramique sur la mer. Idéale pour des vacances de rêve.',
    price: 350,
    location: {
      city: 'Nice',
      country: 'France',
      address: '45 Promenade des Anglais, 06000 Nice'
    },
    images: [
      'https://images.unsplash.com/photo-1613490493576-7fde63acd811?w=800',
      'https://images.unsplash.com/photo-1571896349842-33c89424de2d?w=800',
      'https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?w=800',
      'https://images.unsplash.com/photo-1600607687644-c7171b42498b?w=800'
    ],
    amenities: ['Piscine privée', 'WiFi', 'Cuisine équipée', 'Jardin', 'Parking', 'Climatisation'],
    maxGuests: 8,
    bedrooms: 4,
    bathrooms: 3,
    rating: 4.9,
    reviewCount: 89,
    host: {
      name: 'Pierre Martin',
      avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100',
      isSuperhost: true
    },
    propertyType: 'villa',
    availability: {
      checkIn: '16:00',
      checkOut: '10:00'
    }
  },
  {
    id: '3',
    title: 'Studio cosy en plein centre-ville',
    description: 'Studio moderne et fonctionnel parfaitement situé en centre-ville. Idéal pour un séjour urbain.',
    price: 85,
    location: {
      city: 'Lyon',
      country: 'France',
      address: '12 Rue de la République, 69002 Lyon'
    },
    images: [
      'https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?w=800',
      'https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?w=800',
      'https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?w=800'
    ],
    amenities: ['WiFi', 'Cuisine équipée', 'Climatisation'],
    maxGuests: 2,
    bedrooms: 1,
    bathrooms: 1,
    rating: 4.6,
    reviewCount: 203,
    host: {
      name: 'Sophie Laurent',
      avatar: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=100',
      isSuperhost: false
    },
    propertyType: 'studio',
    availability: {
      checkIn: '14:00',
      checkOut: '12:00'
    }
  },
  {
    id: '4',
    title: 'Maison de campagne avec jardin',
    description: 'Charmante maison de campagne entourée de verdure. Parfait pour se ressourcer en famille.',
    price: 180,
    location: {
      city: 'Provence',
      country: 'France',
      address: 'Chemin des Lavandes, 84100 Orange'
    },
    images: [
      'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=800&q=80',
      'https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?w=800&q=80',
      'https://images.unsplash.com/photo-1600607687920-4e2a09cf159d?w=800&q=80',
      'https://images.unsplash.com/photo-1600566753086-00f18fb6b3ea?w=800&q=80'
    ],
    amenities: ['Jardin', 'WiFi', 'Cuisine équipée', 'Parking', 'Cheminée'],
    maxGuests: 6,
    bedrooms: 3,
    bathrooms: 2,
    rating: 4.7,
    reviewCount: 156,
    host: {
      name: 'Jean-Claude Rousseau',
      avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=100',
      isSuperhost: true
    },
    propertyType: 'house',
    availability: {
      checkIn: '15:00',
      checkOut: '11:00'
    }
  },
  {
    id: '5',
    title: 'Loft industriel rénové',
    description: 'Magnifique loft dans un ancien entrepôt rénové avec charme industriel et design moderne.',
    price: 200,
    location: {
      city: 'Bordeaux',
      country: 'France',
      address: '8 Rue de la Fusterie, 33000 Bordeaux'
    },
    images: [
      'https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?w=800',
      'https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?w=800',
      'https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?w=800',
      'https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?w=800'
    ],
    amenities: ['WiFi', 'Cuisine équipée', 'Climatisation', 'Parking', 'Terrasse'],
    maxGuests: 4,
    bedrooms: 2,
    bathrooms: 2,
    rating: 4.9,
    reviewCount: 94,
    host: {
      name: 'Camille Durand',
      avatar: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=100',
      isSuperhost: true
    },
    propertyType: 'loft',
    availability: {
      checkIn: '16:00',
      checkOut: '10:00'
    }
  }
]

export const propertyTypes = [
  { value: 'apartment', label: 'Appartement' },
  { value: 'house', label: 'Maison' },
  { value: 'villa', label: 'Villa' },
  { value: 'studio', label: 'Studio' },
  { value: 'loft', label: 'Loft' }
]

export const amenities = [
  'WiFi',
  'Cuisine équipée',
  'Climatisation',
  'Parking',
  'Piscine privée',
  'Jardin',
  'Balcon',
  'Terrasse',
  'Cheminée',
  'Lave-linge',
  'Sèche-cheveux',
  'Télévision'
]

