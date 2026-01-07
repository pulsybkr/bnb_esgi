<template>
  <div class="min-h-screen bg-gray-50">
    <!-- Header -->
    <header class="bg-white shadow-sm border-b sticky top-0 z-50">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div class="flex items-center justify-between h-16">
          <div class="flex items-center space-x-4">
            <AppLogo size="medium" color="primary" :clickable="true" />
            <h2 class="text-lg font-semibold text-gray-700">Créer un nouveau logement</h2>
          </div>
          <router-link
            to="/"
            class="text-gray-600 hover:text-gray-900 flex items-center space-x-2"
          >
            <X class="w-5 h-5" />
            <span>Annuler</span>
          </router-link>
        </div>
      </div>
    </header>

    <div class="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <form @submit.prevent="handleSubmit" class="space-y-8">
        <!-- Section Images -->
        <div class="bg-white rounded-lg shadow-sm p-6">
          <h3 class="text-lg font-semibold text-gray-900 mb-4">Photos du logement</h3>
          <p class="text-sm text-gray-600 mb-4">
            Ajoutez au moins 5 photos de votre logement pour mieux le présenter aux voyageurs.
          </p>
          <ImageUpload
            ref="imageUploadRef"
            v-model="formData.images"
            :max-files="20"
            :max-size="10"
            :reorderable="true"
            @error="handleImageError"
          />
          <p v-if="fieldErrors.images" class="text-xs text-red-600 mt-2">{{ fieldErrors.images }}</p>
        </div>

        <!-- Section Informations de base -->
        <div class="bg-white rounded-lg shadow-sm p-6">
          <h3 class="text-lg font-semibold text-gray-900 mb-4">Informations de base</h3>
          
          <div class="space-y-4">
            <!-- Titre -->
            <div>
              <label for="title" class="block text-sm font-medium text-gray-700 mb-1">
                Titre du logement *
              </label>
              <input
                id="title"
                v-model="formData.title"
                type="text"
                required
                maxlength="100"
                placeholder="Ex: Magnifique appartement avec vue sur la Seine"
                class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
              />
              <p class="text-xs text-gray-500 mt-1">{{ formData.title.length }}/100 caractères</p>
            </div>

            <!-- Description -->
            <div>
              <label for="description" class="block text-sm font-medium text-gray-700 mb-1">
                Description *
              </label>
              <textarea
                id="description"
                v-model="formData.description"
                required
                rows="6"
                maxlength="5000"
                placeholder="Décrivez votre logement en détail..."
                :class="[
                  'w-full px-4 py-2 border rounded-lg focus:ring-2 focus:border-transparent resize-none',
                  fieldErrors.description
                    ? 'border-red-500 focus:ring-red-500'
                    : 'border-gray-300 focus:ring-red-500'
                ]"
              ></textarea>
              <p class="text-xs text-gray-500 mt-1">{{ formData.description.length }}/5000 caractères</p>
              <p v-if="fieldErrors.description" class="text-xs text-red-600 mt-1">{{ fieldErrors.description }}</p>
            </div>

            <!-- Type de propriété -->
            <div>
              <label for="propertyType" class="block text-sm font-medium text-gray-700 mb-1">
                Type de propriété *
              </label>
              <select
                id="propertyType"
                v-model="formData.propertyType"
                required
                :class="[
                  'w-full px-4 py-2 border rounded-lg focus:ring-2 focus:border-transparent',
                  fieldErrors.propertyType
                    ? 'border-red-500 focus:ring-red-500'
                    : 'border-gray-300 focus:ring-red-500'
                ]"
              >
                <option value="">Sélectionnez un type</option>
                <option
                  v-for="option in PROPERTY_TYPE_OPTIONS"
                  :key="option.value"
                  :value="option.value"
                >
                  {{ option.label }}
                </option>
              </select>
              <p v-if="fieldErrors.propertyType" class="text-xs text-red-600 mt-1">{{ fieldErrors.propertyType }}</p>
            </div>
          </div>
        </div>

        <!-- Section Localisation -->
        <div class="bg-white rounded-lg shadow-sm p-6">
          <h3 class="text-lg font-semibold text-gray-900 mb-4">Localisation</h3>
          
          <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
            <!-- Adresse -->
            <div class="md:col-span-2">
              <label for="address" class="block text-sm font-medium text-gray-700 mb-1">
                Adresse complète *
              </label>
              <input
                id="address"
                v-model="formData.location.address"
                type="text"
                required
                placeholder="Ex: 15 Quai de la Tournelle, 75005 Paris"
                :class="[
                  'w-full px-4 py-2 border rounded-lg focus:ring-2 focus:border-transparent',
                  fieldErrors.address
                    ? 'border-red-500 focus:ring-red-500'
                    : 'border-gray-300 focus:ring-red-500'
                ]"
              />
              <p v-if="fieldErrors.address" class="text-xs text-red-600 mt-1">{{ fieldErrors.address }}</p>
            </div>

            <!-- Ville -->
            <div>
              <label for="city" class="block text-sm font-medium text-gray-700 mb-1">
                Ville *
              </label>
              <input
                id="city"
                v-model="formData.location.city"
                type="text"
                required
                placeholder="Ex: Paris"
                :class="[
                  'w-full px-4 py-2 border rounded-lg focus:ring-2 focus:border-transparent',
                  fieldErrors.city
                    ? 'border-red-500 focus:ring-red-500'
                    : 'border-gray-300 focus:ring-red-500'
                ]"
              />
              <p v-if="fieldErrors.city" class="text-xs text-red-600 mt-1">{{ fieldErrors.city }}</p>
            </div>

            <!-- Pays -->
            <div>
              <label for="country" class="block text-sm font-medium text-gray-700 mb-1">
                Pays *
              </label>
              <input
                id="country"
                v-model="formData.location.country"
                type="text"
                required
                placeholder="Ex: France"
                :class="[
                  'w-full px-4 py-2 border rounded-lg focus:ring-2 focus:border-transparent',
                  fieldErrors.country
                    ? 'border-red-500 focus:ring-red-500'
                    : 'border-gray-300 focus:ring-red-500'
                ]"
              />
              <p v-if="fieldErrors.country" class="text-xs text-red-600 mt-1">{{ fieldErrors.country }}</p>
            </div>
          </div>
        </div>

        <!-- Section Détails -->
        <div class="bg-white rounded-lg shadow-sm p-6">
          <h3 class="text-lg font-semibold text-gray-900 mb-4">Détails du logement</h3>
          
          <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
            <!-- Nombre de voyageurs -->
            <div>
              <label for="maxGuests" class="block text-sm font-medium text-gray-700 mb-1">
                Nombre maximum de voyageurs *
              </label>
              <input
                id="maxGuests"
                v-model.number="formData.maxGuests"
                type="number"
                required
                min="1"
                max="50"
                :class="[
                  'w-full px-4 py-2 border rounded-lg focus:ring-2 focus:border-transparent',
                  fieldErrors.maxGuests
                    ? 'border-red-500 focus:ring-red-500'
                    : 'border-gray-300 focus:ring-red-500'
                ]"
              />
              <p v-if="fieldErrors.maxGuests" class="text-xs text-red-600 mt-1">{{ fieldErrors.maxGuests }}</p>
            </div>

            <!-- Nombre de chambres -->
            <div>
              <label for="bedrooms" class="block text-sm font-medium text-gray-700 mb-1">
                Nombre de chambres *
              </label>
              <input
                id="bedrooms"
                v-model.number="formData.bedrooms"
                type="number"
                required
                min="0"
                max="20"
                :class="[
                  'w-full px-4 py-2 border rounded-lg focus:ring-2 focus:border-transparent',
                  fieldErrors.bedrooms
                    ? 'border-red-500 focus:ring-red-500'
                    : 'border-gray-300 focus:ring-red-500'
                ]"
              />
              <p v-if="fieldErrors.bedrooms" class="text-xs text-red-600 mt-1">{{ fieldErrors.bedrooms }}</p>
            </div>

            <!-- Nombre de salles de bain -->
            <div>
              <label for="bathrooms" class="block text-sm font-medium text-gray-700 mb-1">
                Nombre de salles de bain *
              </label>
              <input
                id="bathrooms"
                v-model.number="formData.bathrooms"
                type="number"
                required
                min="0"
                max="20"
                step="0.5"
                :class="[
                  'w-full px-4 py-2 border rounded-lg focus:ring-2 focus:border-transparent',
                  fieldErrors.bathrooms
                    ? 'border-red-500 focus:ring-red-500'
                    : 'border-gray-300 focus:ring-red-500'
                ]"
              />
              <p v-if="fieldErrors.bathrooms" class="text-xs text-red-600 mt-1">{{ fieldErrors.bathrooms }}</p>
            </div>
          </div>
        </div>

        <!-- Section Prix -->
        <div class="bg-white rounded-lg shadow-sm p-6">
          <h3 class="text-lg font-semibold text-gray-900 mb-4">Prix par nuit</h3>
          
          <div class="max-w-xs">
            <label for="price" class="block text-sm font-medium text-gray-700 mb-1">
              Prix (€) *
            </label>
            <div class="relative">
              <span class="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-500">€</span>
              <input
                id="price"
                v-model.number="formData.price"
                type="number"
                required
                min="0"
                max="10000"
                step="0.01"
                placeholder="120"
                :class="[
                  'w-full pl-8 pr-4 py-2 border rounded-lg focus:ring-2 focus:border-transparent',
                  fieldErrors.price
                    ? 'border-red-500 focus:ring-red-500'
                    : 'border-gray-300 focus:ring-red-500'
                ]"
              />
              <p v-if="fieldErrors.price" class="text-xs text-red-600 mt-1">{{ fieldErrors.price }}</p>
            </div>
          </div>
        </div>

        <!-- Section Tags -->
        <div class="bg-white rounded-lg shadow-sm p-6">
          <h3 class="text-lg font-semibold text-gray-900 mb-2">Tags</h3>
          <p class="text-sm text-gray-600 mb-4">
            Ajoutez des tags pour mieux décrire votre logement (romantique, vue mer, familial, etc.)
          </p>
          
          <!-- Tags par catégorie -->
          <div class="space-y-4">
            <div v-for="(categoryTags, category) in tagsByCategory" :key="category">
              <h4 class="text-sm font-medium text-gray-700 mb-2 capitalize">{{ category }}</h4>
              <div class="flex flex-wrap gap-2">
                <label
                  v-for="tag in categoryTags"
                  :key="tag.id"
                  class="flex items-center cursor-pointer"
                >
                  <input
                    type="checkbox"
                    :value="tag.id"
                    v-model="formData.tags"
                    class="sr-only peer"
                  />
                  <span
                    class="px-3 py-1.5 text-sm font-medium rounded-full border-2 transition-all peer-checked:bg-red-600 peer-checked:text-white peer-checked:border-red-600 bg-white text-gray-700 border-gray-300 hover:border-gray-400"
                  >
                    {{ tag.label }}
                  </span>
                </label>
              </div>
            </div>
          </div>
        </div>

        <!-- Section Équipements -->
        <div class="bg-white rounded-lg shadow-sm p-6">
          <h3 class="text-lg font-semibold text-gray-900 mb-4">Équipements</h3>
          <p v-if="fieldErrors.amenities" class="text-sm text-red-600 mb-2">{{ fieldErrors.amenities }}</p>
          
          <div class="grid grid-cols-2 md:grid-cols-3 gap-3">
            <label
              v-for="amenity in availableAmenities"
              :key="amenity"
              class="flex items-center space-x-2 cursor-pointer hover:bg-gray-50 p-2 rounded"
            >
              <input
                type="checkbox"
                :value="amenity"
                v-model="formData.amenities"
                class="rounded border-gray-300 text-red-600 focus:ring-red-500"
              />
              <span class="text-sm text-gray-700">{{ amenity }}</span>
            </label>
          </div>
        </div>

        <!-- Section Services supplémentaires -->
        <div class="bg-white rounded-lg shadow-sm p-6">
          <h3 class="text-lg font-semibold text-gray-900 mb-2">Services supplémentaires</h3>
          <p class="text-sm text-gray-600 mb-4">
            Sélectionnez les services optionnels que vous proposez à vos voyageurs (petit-déjeuner, nettoyage, etc.)
          </p>
          
          <div class="space-y-3">
            <label
              v-for="service in availableServices"
              :key="service.id"
              class="flex items-start space-x-3 p-3 border border-gray-200 rounded-lg cursor-pointer hover:bg-gray-50 transition-colors"
            >
              <input
                type="checkbox"
                :value="service.id"
                v-model="formData.services"
                class="mt-1 rounded border-gray-300 text-red-600 focus:ring-red-500"
              />
              <div class="flex-1">
                <div class="flex items-center justify-between">
                  <span class="text-sm font-medium text-gray-900">{{ service.name }}</span>
                  <span class="text-sm font-semibold text-gray-900">
                    €{{ service.price }}
                    <span class="text-xs text-gray-500 font-normal">
                      {{ getPriceTypeLabel(service.priceType) }}
                    </span>
                  </span>
                </div>
                <p v-if="service.description" class="text-xs text-gray-500 mt-1">
                  {{ service.description }}
                </p>
              </div>
            </label>
          </div>
        </div>

        <!-- Section Horaires -->
        <div class="bg-white rounded-lg shadow-sm p-6">
          <h3 class="text-lg font-semibold text-gray-900 mb-4">Horaires d'arrivée et de départ</h3>
          
          <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label for="checkIn" class="block text-sm font-medium text-gray-700 mb-1">
                Heure d'arrivée *
              </label>
                <input
                  id="checkIn"
                  v-model="formData.availability.checkIn"
                  type="time"
                  required
                  :class="[
                    'w-full px-4 py-2 border rounded-lg focus:ring-2 focus:border-transparent',
                    fieldErrors.checkIn
                      ? 'border-red-500 focus:ring-red-500'
                      : 'border-gray-300 focus:ring-red-500'
                  ]"
                />
                <p v-if="fieldErrors.checkIn" class="text-xs text-red-600 mt-1">{{ fieldErrors.checkIn }}</p>
            </div>

            <div>
              <label for="checkOut" class="block text-sm font-medium text-gray-700 mb-1">
                Heure de départ *
              </label>
                <input
                  id="checkOut"
                  v-model="formData.availability.checkOut"
                  type="time"
                  required
                  :class="[
                    'w-full px-4 py-2 border rounded-lg focus:ring-2 focus:border-transparent',
                    fieldErrors.checkOut
                      ? 'border-red-500 focus:ring-red-500'
                      : 'border-gray-300 focus:ring-red-500'
                  ]"
                />
                <p v-if="fieldErrors.checkOut" class="text-xs text-red-600 mt-1">{{ fieldErrors.checkOut }}</p>
            </div>
          </div>
        </div>

        <!-- Messages d'erreur -->
        <div v-if="errorMessage" class="bg-red-50 border border-red-200 rounded-lg p-4">
          <p class="text-sm text-red-800">{{ errorMessage }}</p>
        </div>

        <!-- Boutons d'action -->
        <div class="flex justify-end space-x-4 pb-8">
          <router-link
            to="/"
            class="px-6 py-3 border border-gray-300 rounded-lg text-gray-700 font-medium hover:bg-gray-50 transition-colors duration-200"
          >
            Annuler
          </router-link>
          <button
            type="submit"
            :disabled="isSubmitting"
            class="px-6 py-3 bg-red-600 text-white rounded-lg font-medium hover:bg-red-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors duration-200 flex items-center space-x-2"
          >
            <span v-if="isSubmitting">Publication en cours...</span>
            <span v-else>Publier le logement</span>
            <Loader2 v-if="isSubmitting" class="w-4 h-4 animate-spin" />
          </button>
        </div>
      </form>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive } from 'vue'
import { useRouter } from 'vue-router'
import { X, Loader2 } from 'lucide-vue-next'
import ImageUpload from '@/components/ImageUpload.vue'
import AppLogo from '@/components/AppLogo.vue'
import type { Accommodation, Service } from '@/types/accommodation'
import { PropertyType, PROPERTY_TYPE_OPTIONS } from '@/types/accommodation'
import { availableServices } from '@/data/services'
import { tagsByCategory, getTagLabels } from '@/data/tags'
import { validateAccommodationForm, type ValidationError } from '@/utils/accommodationValidation'
import { logementService } from '@/services/logement.service'

const router = useRouter()
const imageUploadRef = ref<InstanceType<typeof ImageUpload>>()
const isSubmitting = ref(false)
const errorMessage = ref('')
const validationErrors = ref<ValidationError[]>([])
const fieldErrors = ref<Record<string, string>>({})

const availableAmenities = [
  'WiFi',
  'Cuisine équipée',
  'Climatisation',
  'Chauffage',
  'Parking',
  'Balcon',
  'Terrasse',
  'Piscine',
  'Jardin',
  'Machine à laver',
  'Lave-vaisselle',
  'TV',
  'Animaux acceptés',
  'Fumeurs acceptés',
  'Ascenseur',
  'Cheminée',
]

const formData = reactive<{
  images: File[]
  title: string
  description: string
  propertyType: PropertyType | ''
  location: {
    address: string
    city: string
    country: string
  }
  maxGuests: number
  bedrooms: number
  bathrooms: number
  price: number
  amenities: string[]
  tags: string[] // IDs des tags sélectionnés
  services: string[] // IDs des services sélectionnés
  availability: {
    checkIn: string
    checkOut: string
  }
}>({
  images: [],
  title: '',
  description: '',
  propertyType: '',
  location: {
    address: '',
    city: '',
    country: '',
  },
  maxGuests: 1,
  bedrooms: 1,
  bathrooms: 1,
  price: 0,
  amenities: [],
  tags: [],
  services: [],
  availability: {
    checkIn: '15:00',
    checkOut: '11:00',
  },
})

const handleImageError = (error: string) => {
  errorMessage.value = error
  setTimeout(() => {
    errorMessage.value = ''
  }, 5000)
}

const getPriceTypeLabel = (priceType: Service['priceType']): string => {
  switch (priceType) {
    case 'fixed':
      return '(forfait)'
    case 'per_night':
      return '/nuit'
    case 'per_guest':
      return '/personne'
    case 'per_guest_per_night':
      return '/personne/nuit'
    default:
      return ''
  }
}

const validateForm = (): boolean => {
  // Convertir le formData pour la validation
  const formDataForValidation = {
    title: formData.title,
    description: formData.description,
    price: formData.price,
    propertyType: formData.propertyType,
    location: {
      address: formData.location.address,
      city: formData.location.city,
      country: formData.location.country
    },
    maxGuests: formData.maxGuests,
    bedrooms: formData.bedrooms,
    bathrooms: formData.bathrooms,
    images: formData.images,
    amenities: formData.amenities,
    availability: {
      checkIn: formData.availability.checkIn,
      checkOut: formData.availability.checkOut
    }
  }

  // Utiliser la validation complète
  const result = validateAccommodationForm(formDataForValidation)
  
  validationErrors.value = result.errors
  
  // Construire un objet d'erreurs par champ pour l'affichage
  fieldErrors.value = {}
  result.errors.forEach(error => {
    fieldErrors.value[error.field] = error.message
  })

  // Afficher le premier message d'erreur global
  if (!result.isValid && result.errors.length > 0) {
    errorMessage.value = result.errors[0].message
  } else {
    errorMessage.value = ''
  }

  return result.isValid
}

const handleSubmit = async () => {
  errorMessage.value = ''

  if (!validateForm()) {
    window.scrollTo({ top: 0, behavior: 'smooth' })
    return
  }

  isSubmitting.value = true

  try {
    // Récupérer les images avec leur statut isMain depuis le composant ImageUpload
    const imageUploadComponent = imageUploadRef.value
    const imagesInfo = imageUploadComponent?.getImagesInfo?.() || []
    
    // Préparer les données pour l'API
    const propertyData = {
      title: formData.title,
      description: formData.description,
      propertyType: formData.propertyType,
      address: formData.location.address,
      city: formData.location.city,
      country: formData.location.country,
      maxGuests: formData.maxGuests,
      bedrooms: formData.bedrooms,
      bathrooms: formData.bathrooms,
      price: formData.price,
      amenities: formData.amenities,
      tags: getTagLabels(formData.tags),
      services: formData.services,
      checkIn: formData.availability.checkIn,
      checkOut: formData.availability.checkOut,
      images: formData.images,
      imagesInfo: imagesInfo, // Envoyer l'ordre et le statut isMain de chaque image
    }

    // Appeler l'API pour créer le logement
    const accommodation = await logementService.create(propertyData)

    // Rediriger vers la page de détail du logement créé
    router.push({ name: 'accommodation-detail', params: { id: accommodation.id } })
  } catch (err: any) {
    console.error('Erreur:', err)
    errorMessage.value = err.response?.data?.message || 'Une erreur est survenue lors de la publication. Veuillez réessayer.'
    window.scrollTo({ top: 0, behavior: 'smooth' })
  } finally {
    isSubmitting.value = false
  }
}
</script>