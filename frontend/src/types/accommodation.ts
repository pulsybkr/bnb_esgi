export interface Accommodation {
  id: string
  title: string
  description: string
  price: number
  location: {
    city: string
    country: string
    address: string
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
  propertyType: 'apartment' | 'house' | 'villa' | 'studio' | 'loft'
  availability: {
    checkIn: string
    checkOut: string
  }
}

export interface FilterOptions {
  priceRange: [number, number]
  propertyType: string[]
  amenities: string[]
  maxGuests: number
  bedrooms: number
  bathrooms: number
}

