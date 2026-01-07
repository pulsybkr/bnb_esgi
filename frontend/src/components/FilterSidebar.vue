<template>
  <div class="bg-white p-6 rounded-lg shadow-md">
    <h3 class="text-lg font-semibold mb-4">Filtres</h3>
    
    <!-- Type de propriété -->
    <div class="mb-6">
      <h4 class="text-sm font-medium text-gray-900 mb-3">Type de logement</h4>
      <div class="space-y-2">
        <label 
          v-for="type in propertyTypes" 
          :key="type.value"
          class="flex items-center"
        >
          <input 
            type="checkbox" 
            :value="type.value"
            v-model="filters.propertyType"
            class="rounded border-gray-300 bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent focus:ring-indigo-500"
          />
          <span class="ml-2 text-sm text-gray-700">{{ type.label }}</span>
        </label>
      </div>
    </div>

    <!-- Prix -->
    <div class="mb-6">
      <h4 class="text-sm font-medium text-gray-900 mb-3">Prix par nuit</h4>
      <div class="space-y-2">
        <div class="flex items-center">
          <input 
            type="number" 
            v-model.number="filters.priceRange[0]"
            placeholder="Prix min"
            class="w-full px-3 py-2 border border-gray-300 rounded-md text-sm"
          />
          <span class="mx-2 text-gray-500">-</span>
          <input 
            type="number" 
            v-model.number="filters.priceRange[1]"
            placeholder="Prix max"
            class="w-full px-3 py-2 border border-gray-300 rounded-md text-sm"
          />
        </div>
      </div>
    </div>

    <!-- Nombre de voyageurs -->
    <div class="mb-6">
      <h4 class="text-sm font-medium text-gray-900 mb-3">Voyageurs</h4>
      <select 
        v-model.number="filters.maxGuests"
        class="w-full px-3 py-2 border border-gray-300 rounded-md text-sm"
      >
        <option value="">Tous</option>
        <option v-for="i in 10" :key="i" :value="i">{{ i }} voyageur{{ i > 1 ? 's' : '' }}</option>
      </select>
    </div>

    <!-- Chambres -->
    <div class="mb-6">
      <h4 class="text-sm font-medium text-gray-900 mb-3">Chambres</h4>
      <select 
        v-model.number="filters.bedrooms"
        class="w-full px-3 py-2 border border-gray-300 rounded-md text-sm"
      >
        <option value="">Toutes</option>
        <option v-for="i in 5" :key="i" :value="i">{{ i }} chambre{{ i > 1 ? 's' : '' }}</option>
      </select>
    </div>

    <!-- Salles de bain -->
    <div class="mb-6">
      <h4 class="text-sm font-medium text-gray-900 mb-3">Salles de bain</h4>
      <select 
        v-model.number="filters.bathrooms"
        class="w-full px-3 py-2 border border-gray-300 rounded-md text-sm"
      >
        <option value="">Toutes</option>
        <option v-for="i in 5" :key="i" :value="i">{{ i }} salle{{ i > 1 ? 's' : '' }} de bain</option>
      </select>
    </div>

    <!-- Équipements -->
    <div class="mb-6">
      <h4 class="text-sm font-medium text-gray-900 mb-3">Équipements</h4>
      <div class="space-y-2 max-h-40 overflow-y-auto">
        <label 
          v-for="amenity in amenities" 
          :key="amenity"
          class="flex items-center"
        >
          <input 
            type="checkbox" 
            :value="amenity"
            v-model="filters.amenities"
            class="rounded border-gray-300 bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent focus:ring-indigo-500"
          />
          <span class="ml-2 text-sm text-gray-700">{{ amenity }}</span>
        </label>
      </div>
    </div>

    <!-- Tags -->
    <div class="mb-6">
      <h4 class="text-sm font-medium text-gray-900 mb-3">Tags</h4>
      <div class="space-y-2 max-h-48 overflow-y-auto">
        <label 
          v-for="tag in availableTags" 
          :key="tag.id"
          class="flex items-center"
        >
          <input 
            type="checkbox" 
            :value="tag.id"
            v-model="filters.tags"
            class="rounded border-gray-300 bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent focus:ring-indigo-500"
          />
          <span class="ml-2 text-sm text-gray-700">{{ tag.label }}</span>
        </label>
      </div>
    </div>

    <!-- Recherche géolocalisée -->
    <div class="mb-6 border-t pt-6">
      <h4 class="text-sm font-medium text-gray-900 mb-3">Recherche par proximité</h4>
      
      <div class="space-y-3">
        <!-- Adresse ou ville -->
        <div>
          <label class="block text-xs text-gray-600 mb-1">Adresse ou ville</label>
          <input 
            type="text"
            v-model="locationQuery"
            placeholder="Ex: Paris, Lyon..."
            class="w-full px-3 py-2 border border-gray-300 rounded-md text-sm"
            @input="handleLocationInput"
          />
        </div>

        <!-- Rayon -->
        <div>
          <label class="block text-xs text-gray-600 mb-1">Rayon de recherche</label>
          <div class="flex items-center space-x-2">
            <input 
              type="range"
              min="1"
              max="100"
              step="1"
              v-model.number="radiusKm"
              class="flex-1"
              @input="updateLocationFilter"
            />
            <span class="text-sm font-medium text-gray-700 min-w-[60px]">{{ radiusKm }} km</span>
          </div>
        </div>

        <!-- Utiliser ma position -->
        <button
          @click="useMyLocation"
          :disabled="isGettingLocation"
          class="w-full px-3 py-2 text-sm font-medium bg-gradient-to-br from-blue-50 to-indigo-50 rounded-md hover:from-blue-100 hover:to-indigo-100 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-2"
        >
          <MapPin class="w-4 h-4" />
          <span>{{ isGettingLocation ? 'Recherche...' : 'Utiliser ma position' }}</span>
        </button>

        <!-- Effacer le filtre géolocalisé -->
        <button
          v-if="filters.locationRadius"
          @click="clearLocationFilter"
          class="w-full px-3 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200"
        >
          Effacer la recherche par proximité
        </button>
      </div>
    </div>

    <!-- Boutons d'action -->
    <div class="flex space-x-2">
      <button 
        @click="clearFilters"
        class="flex-1 px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200"
      >
        Effacer
      </button>
      <button 
        @click="applyFilters"
        class="flex-1 px-4 py-2 text-sm font-medium text-white bg-gradient-to-r from-blue-600 to-indigo-600 rounded-md hover:from-blue-700 hover:to-indigo-700"
      >
        Appliquer
      </button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, watch } from 'vue'
import { MapPin } from 'lucide-vue-next'
import type { FilterOptions } from '@/types/accommodation'
import { propertyTypes, amenities } from '@/data/fixtures'
import { availableTags } from '@/data/tags'
import { getUserLocation, geocodeAddress } from '@/utils/geolocation'

const emit = defineEmits<{
  filtersChanged: [filters: FilterOptions]
}>()

const filters = ref<FilterOptions>({
  priceRange: [0, 1000],
  propertyType: [],
  amenities: [],
  tags: [],
  maxGuests: 0,
  bedrooms: 0,
  bathrooms: 0
})

const locationQuery = ref('')
const radiusKm = ref(10)
const isGettingLocation = ref(false)

const handleLocationInput = async () => {
  if (!locationQuery.value.trim()) {
    clearLocationFilter()
    return
  }

  // Debounce pour éviter trop d'appels
  const timeout = setTimeout(async () => {
    const coords = await geocodeAddress(locationQuery.value)
    if (coords) {
      filters.value.locationRadius = {
        center: coords,
        radiusKm: radiusKm.value
      }
      emit('filtersChanged', { ...filters.value })
    }
  }, 500)

  return () => clearTimeout(timeout)
}

const updateLocationFilter = () => {
  if (filters.value.locationRadius) {
    filters.value.locationRadius.radiusKm = radiusKm.value
    emit('filtersChanged', { ...filters.value })
  }
}

const useMyLocation = async () => {
  isGettingLocation.value = true
  try {
    const coords = await getUserLocation()
    filters.value.locationRadius = {
      center: coords,
      radiusKm: radiusKm.value
    }
    locationQuery.value = `${coords.latitude.toFixed(4)}, ${coords.longitude.toFixed(4)}`
    emit('filtersChanged', { ...filters.value })
  } catch (error) {
    alert('Impossible d\'obtenir votre position. Veuillez vérifier les paramètres de géolocalisation de votre navigateur.')
    console.error('Erreur géolocalisation:', error)
  } finally {
    isGettingLocation.value = false
  }
}

const clearLocationFilter = () => {
  filters.value.locationRadius = undefined
  locationQuery.value = ''
  emit('filtersChanged', { ...filters.value })
}

const applyFilters = () => {
  emit('filtersChanged', { ...filters.value })
}

const clearFilters = () => {
  filters.value = {
    priceRange: [0, 1000],
    propertyType: [],
    amenities: [],
    tags: [],
    maxGuests: 0,
    bedrooms: 0,
    bathrooms: 0
  }
  locationQuery.value = ''
  radiusKm.value = 10
  emit('filtersChanged', { ...filters.value })
}
</script>

