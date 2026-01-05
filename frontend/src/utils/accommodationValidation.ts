/**
 * Validation des données de logement
 */

import type { Accommodation } from '@/types/accommodation'
import { PropertyType } from '@/types/accommodation'

export interface ValidationError {
  field: string
  message: string
}

export interface ValidationResult {
  isValid: boolean
  errors: ValidationError[]
}

/**
 * Valide un titre de logement
 */
export function validateTitle(title: string): ValidationError | null {
  if (!title || title.trim().length === 0) {
    return {
      field: 'title',
      message: 'Le titre est requis'
    }
  }

  if (title.trim().length < 10) {
    return {
      field: 'title',
      message: 'Le titre doit contenir au moins 10 caractères'
    }
  }

  if (title.trim().length > 200) {
    return {
      field: 'title',
      message: 'Le titre ne doit pas dépasser 200 caractères'
    }
  }

  return null
}

/**
 * Valide une description de logement
 */
export function validateDescription(description: string): ValidationError | null {
  if (!description || description.trim().length === 0) {
    return {
      field: 'description',
      message: 'La description est requise'
    }
  }

  if (description.trim().length < 50) {
    return {
      field: 'description',
      message: 'La description doit contenir au moins 50 caractères'
    }
  }

  if (description.trim().length > 5000) {
    return {
      field: 'description',
      message: 'La description ne doit pas dépasser 5000 caractères'
    }
  }

  return null
}

/**
 * Valide un prix
 */
export function validatePrice(price: number): ValidationError | null {
  if (price === undefined || price === null || isNaN(price)) {
    return {
      field: 'price',
      message: 'Le prix est requis'
    }
  }

  if (price <= 0) {
    return {
      field: 'price',
      message: 'Le prix doit être supérieur à 0'
    }
  }

  if (price > 10000) {
    return {
      field: 'price',
      message: 'Le prix ne doit pas dépasser 10000€ par nuit'
    }
  }

  return null
}

/**
 * Valide une adresse
 */
export function validateAddress(address: string): ValidationError | null {
  if (!address || address.trim().length === 0) {
    return {
      field: 'address',
      message: 'L\'adresse est requise'
    }
  }

  if (address.trim().length < 5) {
    return {
      field: 'address',
      message: 'L\'adresse doit contenir au moins 5 caractères'
    }
  }

  return null
}

/**
 * Valide une ville
 */
export function validateCity(city: string): ValidationError | null {
  if (!city || city.trim().length === 0) {
    return {
      field: 'city',
      message: 'La ville est requise'
    }
  }

  if (city.trim().length < 2) {
    return {
      field: 'city',
      message: 'La ville doit contenir au moins 2 caractères'
    }
  }

  return null
}

/**
 * Valide un pays
 */
export function validateCountry(country: string): ValidationError | null {
  if (!country || country.trim().length === 0) {
    return {
      field: 'country',
      message: 'Le pays est requis'
    }
  }

  if (country.trim().length < 2) {
    return {
      field: 'country',
      message: 'Le pays doit contenir au moins 2 caractères'
    }
  }

  return null
}

/**
 * Valide le type de propriété
 */
export function validatePropertyType(propertyType: string): ValidationError | null {
  if (!propertyType || propertyType.trim().length === 0) {
    return {
      field: 'propertyType',
      message: 'Le type de propriété est requis'
    }
  }

  const validTypes = Object.values(PropertyType)
  if (!validTypes.includes(propertyType as PropertyType)) {
    return {
      field: 'propertyType',
      message: 'Le type de propriété n\'est pas valide'
    }
  }

  return null
}

/**
 * Valide le nombre de voyageurs
 */
export function validateMaxGuests(maxGuests: number): ValidationError | null {
  if (maxGuests === undefined || maxGuests === null || isNaN(maxGuests)) {
    return {
      field: 'maxGuests',
      message: 'Le nombre de voyageurs est requis'
    }
  }

  if (maxGuests < 1) {
    return {
      field: 'maxGuests',
      message: 'Le nombre de voyageurs doit être au moins 1'
    }
  }

  if (maxGuests > 50) {
    return {
      field: 'maxGuests',
      message: 'Le nombre de voyageurs ne doit pas dépasser 50'
    }
  }

  return null
}

/**
 * Valide le nombre de chambres
 */
export function validateBedrooms(bedrooms: number): ValidationError | null {
  if (bedrooms === undefined || bedrooms === null || isNaN(bedrooms)) {
    return {
      field: 'bedrooms',
      message: 'Le nombre de chambres est requis'
    }
  }

  if (bedrooms < 0) {
    return {
      field: 'bedrooms',
      message: 'Le nombre de chambres ne peut pas être négatif'
    }
  }

  if (bedrooms > 20) {
    return {
      field: 'bedrooms',
      message: 'Le nombre de chambres ne doit pas dépasser 20'
    }
  }

  return null
}

/**
 * Valide le nombre de salles de bain
 */
export function validateBathrooms(bathrooms: number): ValidationError | null {
  if (bathrooms === undefined || bathrooms === null || isNaN(bathrooms)) {
    return {
      field: 'bathrooms',
      message: 'Le nombre de salles de bain est requis'
    }
  }

  if (bathrooms < 0) {
    return {
      field: 'bathrooms',
      message: 'Le nombre de salles de bain ne peut pas être négatif'
    }
  }

  if (bathrooms > 20) {
    return {
      field: 'bathrooms',
      message: 'Le nombre de salles de bain ne doit pas dépasser 20'
    }
  }

  return null
}

/**
 * Valide les images
 */
export function validateImages(images: File[] | string[]): ValidationError | null {
  if (!images || images.length === 0) {
    return {
      field: 'images',
      message: 'Au moins une image est requise'
    }
  }

  if (images.length > 20) {
    return {
      field: 'images',
      message: 'Le nombre d\'images ne doit pas dépasser 20'
    }
  }

  // Si ce sont des fichiers, valider leur type et taille
  if (images.length > 0 && images[0] instanceof File) {
    const files = images as File[]
    const maxSize = 10 * 1024 * 1024 // 10 MB
    const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp']

    for (let i = 0; i < files.length; i++) {
      const file = files[i]

      if (!allowedTypes.includes(file.type)) {
        return {
          field: 'images',
          message: `L'image ${i + 1} doit être au format JPG, PNG ou WEBP`
        }
      }

      if (file.size > maxSize) {
        return {
          field: 'images',
          message: `L'image ${i + 1} ne doit pas dépasser 10 MB`
        }
      }
    }
  }

  return null
}

/**
 * Valide les équipements
 */
export function validateAmenities(amenities: string[]): ValidationError | null {
  if (!amenities || amenities.length === 0) {
    return {
      field: 'amenities',
      message: 'Au moins un équipement est requis'
    }
  }

  if (amenities.length > 50) {
    return {
      field: 'amenities',
      message: 'Le nombre d\'équipements ne doit pas dépasser 50'
    }
  }

  return null
}

/**
 * Valide les heures de check-in et check-out
 */
export function validateCheckIn(checkIn: string): ValidationError | null {
  if (!checkIn || checkIn.trim().length === 0) {
    return {
      field: 'checkIn',
      message: 'L\'heure de check-in est requise'
    }
  }

  // Format HH:MM
  const timeRegex = /^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/
  if (!timeRegex.test(checkIn)) {
    return {
      field: 'checkIn',
      message: 'L\'heure de check-in doit être au format HH:MM (ex: 15:00)'
    }
  }

  return null
}

export function validateCheckOut(checkOut: string): ValidationError | null {
  if (!checkOut || checkOut.trim().length === 0) {
    return {
      field: 'checkOut',
      message: 'L\'heure de check-out est requise'
    }
  }

  // Format HH:MM
  const timeRegex = /^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/
  if (!timeRegex.test(checkOut)) {
    return {
      field: 'checkOut',
      message: 'L\'heure de check-out doit être au format HH:MM (ex: 11:00)'
    }
  }

  return null
}

/**
 * Interface pour les données de formulaire de création de logement
 */
export interface AccommodationFormData {
  title: string
  description: string
  price: number
  propertyType: string
  location: {
    address: string
    city: string
    country: string
  }
  maxGuests: number
  bedrooms: number
  bathrooms: number
  images: File[]
  amenities: string[]
  services?: string[]
  tags?: string[]
  availability: {
    checkIn: string
    checkOut: string
  }
}

/**
 * Valide toutes les données d'un formulaire de logement
 */
export function validateAccommodationForm(
  formData: AccommodationFormData
): ValidationResult {
  const errors: ValidationError[] = []

  // Validation du titre
  const titleError = validateTitle(formData.title)
  if (titleError) errors.push(titleError)

  // Validation de la description
  const descriptionError = validateDescription(formData.description)
  if (descriptionError) errors.push(descriptionError)

  // Validation du prix
  const priceError = validatePrice(formData.price)
  if (priceError) errors.push(priceError)

  // Validation du type de propriété
  const propertyTypeError = validatePropertyType(formData.propertyType)
  if (propertyTypeError) errors.push(propertyTypeError)

  // Validation de l'adresse
  const addressError = validateAddress(formData.location.address)
  if (addressError) errors.push(addressError)

  // Validation de la ville
  const cityError = validateCity(formData.location.city)
  if (cityError) errors.push(cityError)

  // Validation du pays
  const countryError = validateCountry(formData.location.country)
  if (countryError) errors.push(countryError)

  // Validation du nombre de voyageurs
  const maxGuestsError = validateMaxGuests(formData.maxGuests)
  if (maxGuestsError) errors.push(maxGuestsError)

  // Validation du nombre de chambres
  const bedroomsError = validateBedrooms(formData.bedrooms)
  if (bedroomsError) errors.push(bedroomsError)

  // Validation du nombre de salles de bain
  const bathroomsError = validateBathrooms(formData.bathrooms)
  if (bathroomsError) errors.push(bathroomsError)

  // Validation des images
  const imagesError = validateImages(formData.images)
  if (imagesError) errors.push(imagesError)

  // Validation des équipements
  const amenitiesError = validateAmenities(formData.amenities)
  if (amenitiesError) errors.push(amenitiesError)

  // Validation des heures
  const checkInError = validateCheckIn(formData.availability.checkIn)
  if (checkInError) errors.push(checkInError)

  const checkOutError = validateCheckOut(formData.availability.checkOut)
  if (checkOutError) errors.push(checkOutError)

  return {
    isValid: errors.length === 0,
    errors
  }
}

/**
 * Obtient le message d'erreur pour un champ spécifique
 */
export function getFieldError(
  errors: ValidationError[],
  fieldName: string
): string | undefined {
  const error = errors.find(err => err.field === fieldName)
  return error?.message
}

/**
 * Valide un objet Accommodation complet (pour validation côté serveur/API)
 */
export function validateAccommodation(
  accommodation: Partial<Accommodation>
): ValidationResult {
  const errors: ValidationError[] = []

  if (accommodation.title !== undefined) {
    const error = validateTitle(accommodation.title)
    if (error) errors.push(error)
  }

  if (accommodation.description !== undefined) {
    const error = validateDescription(accommodation.description)
    if (error) errors.push(error)
  }

  if (accommodation.price !== undefined) {
    const error = validatePrice(accommodation.price)
    if (error) errors.push(error)
  }

  if (accommodation.propertyType !== undefined) {
    const error = validatePropertyType(accommodation.propertyType)
    if (error) errors.push(error)
  }

  if (accommodation.location) {
    if (accommodation.location.address) {
      const error = validateAddress(accommodation.location.address)
      if (error) errors.push(error)
    }

    if (accommodation.location.city) {
      const error = validateCity(accommodation.location.city)
      if (error) errors.push(error)
    }

    if (accommodation.location.country) {
      const error = validateCountry(accommodation.location.country)
      if (error) errors.push(error)
    }
  }

  if (accommodation.maxGuests !== undefined) {
    const error = validateMaxGuests(accommodation.maxGuests)
    if (error) errors.push(error)
  }

  if (accommodation.bedrooms !== undefined) {
    const error = validateBedrooms(accommodation.bedrooms)
    if (error) errors.push(error)
  }

  if (accommodation.bathrooms !== undefined) {
    const error = validateBathrooms(accommodation.bathrooms)
    if (error) errors.push(error)
  }

  if (accommodation.images) {
    const error = validateImages(accommodation.images)
    if (error) errors.push(error)
  }

  if (accommodation.amenities) {
    const error = validateAmenities(accommodation.amenities)
    if (error) errors.push(error)
  }

  return {
    isValid: errors.length === 0,
    errors
  }
}

