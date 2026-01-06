<template>
  <div v-if="popularAccommodations.length > 0" class="mt-8">
    <div class="flex items-center justify-between mb-6">
      <div>
        <h2 class="text-2xl font-bold text-gray-900">Logements populaires</h2>
        <p v-if="locationLabel" class="text-sm text-gray-600 mt-1">
          {{ locationLabel }}
        </p>
      </div>
    </div>
    
    <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      <AccommodationCard
        v-for="accommodation in popularAccommodations"
        :key="accommodation.id"
        :accommodation="accommodation"
        @click="$emit('accommodation-selected', accommodation.id)"
        class="cursor-pointer"
      />
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import AccommodationCard from '@/components/AccommodationCard.vue'
import type { Accommodation } from '@/types/accommodation'
import { findPopularAccommodations } from '@/utils/accommodationSimilarity'
import type { Coordinates } from '@/utils/geolocation'
import { formatDistance } from '@/utils/geolocation'

interface Props {
  allAccommodations: Accommodation[]
  location?: Coordinates
  locationName?: string
  radiusKm?: number
  maxResults?: number
}

const props = withDefaults(defineProps<Props>(), {
  radiusKm: 50,
  maxResults: 6
})

const emit = defineEmits<{
  'accommodation-selected': [id: string]
}>()

const popularAccommodations = computed(() => {
  return findPopularAccommodations(
    props.allAccommodations,
    props.location,
    props.radiusKm,
    props.maxResults
  )
})

const locationLabel = computed(() => {
  if (props.locationName) {
    return `Autour de ${props.locationName}`
  }
  if (props.location) {
    return `Autour de votre position (rayon: ${props.radiusKm}km)`
  }
  return 'Les mieux notés'
})
</script>

