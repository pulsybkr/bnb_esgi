import type { Accommodation } from '@/types/accommodation'
import { PropertyType } from '@/types/accommodation'

export const accommodations: Accommodation[] = [
  {
    id: '1',
    title: 'Magnifique appartement avec vue sur la Seine',
    description: 'Appartement moderne et élégant situé au cœur de Paris, avec une vue imprenable sur la Seine. Parfait pour découvrir la ville lumière.',
    price: 120,
          location: {
            city: 'Paris',
            country: 'France',
            address: '15 Quai de la Tournelle, 75005 Paris',
            coordinates: {
              latitude: 48.8506,
              longitude: 2.3548
            }
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
    propertyType: PropertyType.APARTMENT,
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
            address: '45 Promenade des Anglais, 06000 Nice',
            coordinates: {
              latitude: 43.6956,
              longitude: 7.2556
            }
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
    propertyType: PropertyType.VILLA,
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
      address: '12 Rue de la République, 69002 Lyon',
      coordinates: {
        latitude: 45.7640,
        longitude: 4.8357
      }
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
    propertyType: PropertyType.STUDIO,
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
      address: 'Chemin des Lavandes, 84100 Orange',
      coordinates: {
        latitude: 44.1369,
        longitude: 4.8086
      }
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
    propertyType: PropertyType.HOUSE,
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
      address: '8 Rue de la Fusterie, 33000 Bordeaux',
      coordinates: {
        latitude: 44.8378,
        longitude: -0.5792
      }
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
    propertyType: PropertyType.LOFT,
    availability: {
      checkIn: '16:00',
      checkOut: '10:00'
    }
  },
  {
    id: '6',
    title: 'Appartement moderne avec terrasse',
    description: 'Superbe appartement contemporain avec grande terrasse et vue dégagée. Parfait pour les séjours en ville.',
    price: 95,
    location: {
      city: 'Marseille',
      country: 'France',
      address: '22 Rue Paradis, 13001 Marseille',
      coordinates: {
        latitude: 43.2965,
        longitude: 5.3698
      }
    },
    images: [
      'https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?w=800&q=80',
      'https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?w=800&q=80',
      'https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?w=800&q=80',
      'https://images.unsplash.com/photo-1560448204-603b3fc33ddc?w=800&q=80'
    ],
    amenities: ['WiFi', 'Cuisine équipée', 'Terrasse', 'Climatisation'],
    maxGuests: 3,
    bedrooms: 1,
    bathrooms: 1,
    rating: 4.5,
    reviewCount: 78,
    host: {
      name: 'Thomas Bernard',
      avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=100',
      isSuperhost: false
    },
    propertyType: PropertyType.APARTMENT,
    availability: {
      checkIn: '15:00',
      checkOut: '11:00'
    }
  },
  {
    id: '7',
    title: 'Villa luxueuse avec vue mer',
    description: 'Villa d\'exception en bord de mer avec piscine à débordement et accès privé à la plage.',
    price: 450,
    location: {
      city: 'Cannes',
      country: 'France',
      address: '10 Boulevard de la Croisette, 06400 Cannes',
      coordinates: {
        latitude: 43.5528,
        longitude: 7.0174
      }
    },
    images: [
      'https://images.unsplash.com/photo-1613490493576-7fde63acd811?w=800&q=80',
      'https://images.unsplash.com/photo-1600607687920-4e2a09cf159d?w=800&q=80',
      'https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?w=800&q=80',
      'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=800&q=80'
    ],
    amenities: ['Piscine privée', 'WiFi', 'Cuisine équipée', 'Jardin', 'Parking', 'Climatisation', 'Vue mer'],
    maxGuests: 10,
    bedrooms: 5,
    bathrooms: 4,
    rating: 5.0,
    reviewCount: 145,
    host: {
      name: 'Isabelle Moreau',
      avatar: 'https://images.unsplash.com/photo-1487412720507-e7ab37603c6f?w=100',
      isSuperhost: true
    },
    propertyType: PropertyType.VILLA,
    availability: {
      checkIn: '16:00',
      checkOut: '11:00'
    }
  },
  {
    id: '8',
    title: 'Chalet montagnard avec cheminée',
    description: 'Authentique chalet alpin avec vue sur les montagnes. Idéal pour les vacances au ski.',
    price: 220,
    location: {
      city: 'Chamonix',
      country: 'France',
      address: '45 Route des Praz, 74400 Chamonix',
      coordinates: {
        latitude: 45.9237,
        longitude: 6.8694
      }
    },
    images: [
      'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=800&q=80',
      'https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?w=800&q=80',
      'https://images.unsplash.com/photo-1600566753086-00f18fb6b3ea?w=800&q=80',
      'https://images.unsplash.com/photo-1600607687920-4e2a09cf159d?w=800&q=80'
    ],
    amenities: ['Cheminée', 'WiFi', 'Cuisine équipée', 'Parking', 'Balcon'],
    maxGuests: 6,
    bedrooms: 3,
    bathrooms: 2,
    rating: 4.8,
    reviewCount: 112,
    host: {
      name: 'Marc Dubois',
      avatar: 'https://images.unsplash.com/photo-1463453091185-61582044d556?w=100',
      isSuperhost: true
    },
    propertyType: PropertyType.HOUSE,
    availability: {
      checkIn: '15:00',
      checkOut: '10:00'
    }
  },
  {
    id: '9',
    title: 'Studio design en hypercentre',
    description: 'Studio ultramoderne au cœur de la ville, proche de toutes commodités.',
    price: 70,
    location: {
      city: 'Toulouse',
      country: 'France',
      address: '5 Place du Capitole, 31000 Toulouse',
      coordinates: {
        latitude: 43.6047,
        longitude: 1.4442
      }
    },
    images: [
      'https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?w=800&q=80',
      'https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?w=800&q=80',
      'https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?w=800&q=80'
    ],
    amenities: ['WiFi', 'Cuisine équipée', 'Climatisation'],
    maxGuests: 2,
    bedrooms: 1,
    bathrooms: 1,
    rating: 4.4,
    reviewCount: 65,
    host: {
      name: 'Laura Petit',
      avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100',
      isSuperhost: false
    },
    propertyType: PropertyType.STUDIO,
    availability: {
      checkIn: '14:00',
      checkOut: '12:00'
    }
  },
  {
    id: '10',
    title: 'Appartement familial spacieux',
    description: 'Grand appartement familial avec 3 chambres, parfait pour des vacances en groupe.',
    price: 160,
    location: {
      city: 'Nantes',
      country: 'France',
      address: '18 Rue Crébillon, 44000 Nantes',
      coordinates: {
        latitude: 47.2184,
        longitude: -1.5536
      }
    },
    images: [
      'https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?w=800&q=80',
      'https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?w=800&q=80',
      'https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?w=800&q=80',
      'https://images.unsplash.com/photo-1560448204-603b3fc33ddc?w=800&q=80'
    ],
    amenities: ['WiFi', 'Cuisine équipée', 'Lave-linge', 'Parking', 'Balcon'],
    maxGuests: 6,
    bedrooms: 3,
    bathrooms: 2,
    rating: 4.7,
    reviewCount: 98,
    host: {
      name: 'Antoine Garcia',
      avatar: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=100',
      isSuperhost: true
    },
    propertyType: PropertyType.APARTMENT,
    availability: {
      checkIn: '15:00',
      checkOut: '11:00'
    }
  },
  {
    id: '11',
    title: 'Maison de charme avec piscine',
    description: 'Belle maison provençale avec piscine chauffée et grand jardin arboré.',
    price: 280,
    location: {
      city: 'Aix-en-Provence',
      country: 'France',
      address: '12 Chemin des Oliviers, 13100 Aix-en-Provence',
      coordinates: {
        latitude: 43.5293,
        longitude: 5.4474
      }
    },
    images: [
      'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=800&q=80',
      'https://images.unsplash.com/photo-1613490493576-7fde63acd811?w=800&q=80',
      'https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?w=800&q=80',
      'https://images.unsplash.com/photo-1600607687920-4e2a09cf159d?w=800&q=80'
    ],
    amenities: ['Piscine privée', 'WiFi', 'Cuisine équipée', 'Jardin', 'Parking', 'Climatisation', 'BBQ'],
    maxGuests: 8,
    bedrooms: 4,
    bathrooms: 3,
    rating: 4.9,
    reviewCount: 134,
    host: {
      name: 'Sandrine Lefebvre',
      avatar: 'https://images.unsplash.com/photo-1488426862026-3ee34a7d66df?w=100',
      isSuperhost: true
    },
    propertyType: PropertyType.HOUSE,
    availability: {
      checkIn: '16:00',
      checkOut: '10:00'
    }
  },
  {
    id: '12',
    title: 'Loft atypique avec mezzanine',
    description: 'Loft unique avec mezzanine, hauteur sous plafond exceptionnelle et grande verrière.',
    price: 190,
    location: {
      city: 'Lille',
      country: 'France',
      address: '30 Rue de Béthune, 59000 Lille',
      coordinates: {
        latitude: 50.6292,
        longitude: 3.0573
      }
    },
    images: [
      'https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?w=800&q=80',
      'https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?w=800&q=80',
      'https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?w=800&q=80',
      'https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?w=800&q=80'
    ],
    amenities: ['WiFi', 'Cuisine équipée', 'Climatisation', 'Parking'],
    maxGuests: 4,
    bedrooms: 2,
    bathrooms: 1,
    rating: 4.6,
    reviewCount: 87,
    host: {
      name: 'Julien Martin',
      avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100',
      isSuperhost: false
    },
    propertyType: PropertyType.LOFT,
    availability: {
      checkIn: '15:00',
      checkOut: '11:00'
    }
  }
]

// Export PROPERTY_TYPE_OPTIONS depuis types pour compatibilité
export { PROPERTY_TYPE_OPTIONS as propertyTypes } from '@/types/accommodation'

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

