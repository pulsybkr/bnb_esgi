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
            class="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
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
            class="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
          />
          <span class="ml-2 text-sm text-gray-700">{{ amenity }}</span>
        </label>
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
        class="flex-1 px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700"
      >
        Appliquer
      </button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, watch } from 'vue'
import type { FilterOptions } from '@/types/accommodation'
import { propertyTypes, amenities } from '@/data/fixtures'

const emit = defineEmits<{
  filtersChanged: [filters: FilterOptions]
}>()

const filters = ref<FilterOptions>({
  priceRange: [0, 1000],
  propertyType: [],
  amenities: [],
  maxGuests: 0,
  bedrooms: 0,
  bathrooms: 0
})

const applyFilters = () => {
  emit('filtersChanged', { ...filters.value })
}

const clearFilters = () => {
  filters.value = {
    priceRange: [0, 1000],
    propertyType: [],
    amenities: [],
    maxGuests: 0,
    bedrooms: 0,
    bathrooms: 0
  }
  emit('filtersChanged', { ...filters.value })
}
</script>

