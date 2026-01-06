<template>
  <!-- Modal Backdrop -->
  <Transition name="modal-backdrop">
    <div
      v-if="isOpen"
      @click="close"
      class="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4 animate-fade-in"
    >
      <!-- Modal Content -->
      <div
        @click.stop
        class="bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-hidden animate-scale-in"
      >
        <!-- Header -->
        <div class="flex items-center justify-between p-6 border-b border-gray-200">
          <h2 class="text-2xl font-bold text-gray-900">Filtres</h2>
          <button
            @click="close"
            class="p-2 hover:bg-gray-100 rounded-full transition-colors"
            type="button"
          >
            <X class="w-5 h-5 text-gray-500" />
          </button>
        </div>

        <!-- Body -->
        <div class="p-6 overflow-y-auto max-h-[calc(90vh-180px)] custom-scrollbar">
          <div class="space-y-6">
            <!-- Type de propriété -->
            <div>
              <label class="block text-sm font-semibold text-gray-900 mb-3">
                <Home class="w-4 h-4 inline mr-2" />
                Type de logement
              </label>
              <MultiSelect
                v-model="localFilters.propertyType"
                :options="propertyTypeOptions"
                placeholder="Sélectionner les types..."
              />
            </div>

            <!-- Prix -->
            <div>
              <label class="block text-sm font-semibold text-gray-900 mb-3">
                <DollarSign class="w-4 h-4 inline mr-2" />
                Prix par nuit
              </label>
              <div class="flex items-center gap-3">
                <input
                  v-model.number="localFilters.priceRange[0]"
                  type="number"
                  placeholder="Min"
                  class="flex-1 px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-african-green focus:border-transparent"
                />
                <span class="text-gray-500">-</span>
                <input
                  v-model.number="localFilters.priceRange[1]"
                  type="number"
                  placeholder="Max"
                  class="flex-1 px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-african-green focus:border-transparent"
                />
              </div>
            </div>

            <!-- Voyageurs -->
            <div>
              <label class="block text-sm font-semibold text-gray-900 mb-3">
                <Users class="w-4 h-4 inline mr-2" />
                Nombre de voyageurs
              </label>
              <QuantityInput
                v-model="localFilters.maxGuests"
                :min="0"
                :max="20"
              />
            </div>

            <!-- Chambres -->
            <div>
              <label class="block text-sm font-semibold text-gray-900 mb-3">
                <Bed class="w-4 h-4 inline mr-2" />
                Chambres
              </label>
              <QuantityInput
                v-model="localFilters.bedrooms"
                :min="0"
                :max="10"
              />
            </div>

            <!-- Salles de bain -->
            <div>
              <label class="block text-sm font-semibold text-gray-900 mb-3">
                <Bath class="w-4 h-4 inline mr-2" />
                Salles de bain
              </label>
              <QuantityInput
                v-model="localFilters.bathrooms"
                :min="0"
                :max="10"
              />
            </div>

            <!-- Équipements -->
            <div>
              <label class="block text-sm font-semibold text-gray-900 mb-3">
                <Sparkles class="w-4 h-4 inline mr-2" />
                Équipements
              </label>
              <MultiSelect
                v-model="localFilters.amenities"
                :options="amenityOptions"
                placeholder="Sélectionner les équipements..."
              />
            </div>

            <!-- Tags -->
            <div>
              <label class="block text-sm font-semibold text-gray-900 mb-3">
                <Tag class="w-4 h-4 inline mr-2" />
                Tags
              </label>
              <MultiSelect
                v-model="localFilters.tags"
                :options="tagOptions"
                placeholder="Sélectionner les tags..."
              />
            </div>

            <!-- Recherche par proximité -->
            <div class="border-t pt-6">
              <label class="block text-sm font-semibold text-gray-900 mb-3">
                <MapPin class="w-4 h-4 inline mr-2" />
                Recherche par proximité
              </label>
              
              <div class="space-y-3">
                <input
                  v-model="locationQuery"
                  type="text"
                  placeholder="Ville ou adresse..."
                  class="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-african-green focus:border-transparent"
                  @input="handleLocationInput"
                />

                <div>
                  <div class="flex items-center justify-between mb-2">
                    <span class="text-sm text-gray-600">Rayon de recherche</span>
                    <span class="text-sm font-medium text-african-green">{{ radiusKm }} km</span>
                  </div>
                  <input
                    v-model.number="radiusKm"
                    type="range"
                    min="1"
                    max="100"
                    step="1"
                    class="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-african-green"
                    @input="updateLocationFilter"
                  />
                </div>

                <button
                  @click="useMyLocation"
                  :disabled="isGettingLocation"
                  class="w-full px-4 py-2.5 text-sm font-medium text-african-green bg-green-50 rounded-lg hover:bg-green-100 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 transition-colors"
                  type="button"
                >
                  <MapPin class="w-4 h-4" />
                  <span>{{ isGettingLocation ? 'Recherche...' : 'Utiliser ma position' }}</span>
                </button>

                <button
                  v-if="localFilters.locationRadius"
                  @click="clearLocationFilter"
                  class="w-full px-4 py-2.5 text-sm font-medium text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
                  type="button"
                >
                  Effacer la recherche par proximité
                </button>
              </div>
            </div>
          </div>
        </div>

        <!-- Footer -->
        <div class="flex items-center gap-3 p-6 border-t border-gray-200 bg-gray-50">
          <button
            @click="clearFilters"
            class="flex-1 px-6 py-3 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
            type="button"
          >
            Effacer tout
          </button>
          <button
            @click="applyFilters"
            class="flex-1 px-6 py-3 text-sm font-medium text-white bg-african-green rounded-lg hover:bg-african-green-dark transition-colors shadow-sm"
            type="button"
          >
            Appliquer les filtres
          </button>
        </div>
      </div>
    </div>
  </Transition>
</template>

<script setup lang="ts">
import { ref, watch } from 'vue'
import { X, Home, DollarSign, Users, Bed, Bath, Sparkles, Tag, MapPin } from 'lucide-vue-next'
import MultiSelect from './MultiSelect.vue'
import QuantityInput from './QuantityInput.vue'
import type { FilterOptions } from '@/types/accommodation'
import type { MultiSelectOption } from './MultiSelect.vue'
import { propertyTypes, amenities } from '@/data/fixtures'
import { availableTags } from '@/data/tags'
import { getUserLocation, geocodeAddress } from '@/utils/geolocation'

const props = defineProps<{
  isOpen: boolean
  filters: FilterOptions
}>()

const emit = defineEmits<{
  close: []
  'filters-changed': [filters: FilterOptions]
}>()

// Local copy of filters
const localFilters = ref<FilterOptions>({ ...props.filters })
const locationQuery = ref('')
const radiusKm = ref(10)
const isGettingLocation = ref(false)

// Watch for external filter changes
watch(() => props.filters, (newFilters) => {
  localFilters.value = { ...newFilters }
}, { deep: true })

// Property type options
const propertyTypeOptions: MultiSelectOption[] = propertyTypes.map(type => ({
  value: type.value,
  label: type.label
}))

// Amenity options
const amenityOptions: MultiSelectOption[] = amenities.map(amenity => ({
  value: amenity,
  label: amenity
}))

// Tag options
const tagOptions: MultiSelectOption[] = availableTags.map(tag => ({
  value: tag.id,
  label: tag.label
}))

const handleLocationInput = async () => {
  if (!locationQuery.value.trim()) {
    clearLocationFilter()
    return
  }

  const coords = await geocodeAddress(locationQuery.value)
  if (coords) {
    localFilters.value.locationRadius = {
      center: coords,
      radiusKm: radiusKm.value
    }
  }
}

const updateLocationFilter = () => {
  if (localFilters.value.locationRadius) {
    localFilters.value.locationRadius.radiusKm = radiusKm.value
  }
}

const useMyLocation = async () => {
  isGettingLocation.value = true
  try {
    const coords = await getUserLocation()
    localFilters.value.locationRadius = {
      center: coords,
      radiusKm: radiusKm.value
    }
    locationQuery.value = `${coords.latitude.toFixed(4)}, ${coords.longitude.toFixed(4)}`
  } catch (error) {
    alert('Impossible d\'obtenir votre position. Veuillez vérifier les paramètres de géolocalisation de votre navigateur.')
    console.error('Erreur géolocalisation:', error)
  } finally {
    isGettingLocation.value = false
  }
}

const clearLocationFilter = () => {
  localFilters.value.locationRadius = undefined
  locationQuery.value = ''
}

const applyFilters = () => {
  emit('filters-changed', { ...localFilters.value })
  close()
}

const clearFilters = () => {
  localFilters.value = {
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
}

const close = () => {
  emit('close')
}
</script>

<style scoped>
.modal-backdrop-enter-active,
.modal-backdrop-leave-active {
  transition: opacity 0.3s ease;
}

.modal-backdrop-enter-from,
.modal-backdrop-leave-to {
  opacity: 0;
}
</style>
