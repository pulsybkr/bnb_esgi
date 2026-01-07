<template>
  <div v-if="recommendedAccommodations.length > 0" class="mt-12">
    <div class="flex items-center justify-between mb-6">
      <div>
        <h2 class="text-2xl font-bold text-gray-900">Recommandations pour vous</h2>
        <p class="text-sm text-gray-600 mt-1">
          {{ recommendationDescription }}
        </p>
      </div>
    </div>
    
    <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      <AccommodationCard
        v-for="accommodation in recommendedAccommodations"
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
import AccommodationCard from '@/components/accommodation/AccommodationCard.vue'
import type { Accommodation } from '@/types/accommodation'
import { getRecommendedAccommodations } from '@/utils/recommendations'
import {
  getBasicRecommendations,
  getBudgetFriendlyRecommendations,
  getTopRatedRecommendations,
  getSuperhostRecommendations,
  getBalancedRecommendations
} from '@/utils/basicRecommendations'

interface Props {
  allAccommodations: Accommodation[]
  userPreferences?: {
    preferredCities?: string[]
    priceRange?: [number, number]
    propertyTypes?: string[]
    preferredAmenities?: string[]
    maxGuests?: number
  }
  excludeAccommodationIds?: string[]
  maxResults?: number
  recommendationType?: 'personalized' | 'trending' | 'new' | 'value' | 'basic' | 'budget' | 'top-rated' | 'superhost' | 'balanced'
}

const props = withDefaults(defineProps<Props>(), {
  excludeAccommodationIds: () => [],
  maxResults: 6,
  recommendationType: 'personalized'
})

const emit = defineEmits<{
  'accommodation-selected': [id: string]
}>()

const recommendedAccommodations = computed(() => {
  // Utiliser les algorithmes basiques pour certains types
  switch (props.recommendationType) {
    case 'basic':
      return getBasicRecommendations(
        props.allAccommodations,
        props.excludeAccommodationIds,
        props.maxResults
      )
    case 'budget':
      return getBudgetFriendlyRecommendations(
        props.allAccommodations,
        props.excludeAccommodationIds,
        props.maxResults
      )
    case 'top-rated':
      return getTopRatedRecommendations(
        props.allAccommodations,
        props.excludeAccommodationIds,
        props.maxResults
      )
    case 'superhost':
      return getSuperhostRecommendations(
        props.allAccommodations,
        props.excludeAccommodationIds,
        props.maxResults
      )
    case 'balanced':
      return getBalancedRecommendations(
        props.allAccommodations,
        props.excludeAccommodationIds,
        props.maxResults
      )
    default:
      // Utiliser l'algorithme avancé pour les autres types
      return getRecommendedAccommodations(
        props.allAccommodations,
        props.userPreferences,
        props.excludeAccommodationIds,
        props.maxResults,
        props.recommendationType
      )
  }
})

const recommendationDescription = computed(() => {
  switch (props.recommendationType) {
    case 'trending':
      return 'Les logements les plus populaires en ce moment'
    case 'new':
      return 'Nouveaux logements ajoutés récemment'
    case 'value':
      return 'Les meilleurs rapports qualité-prix'
    case 'basic':
      return 'Recommandations basées sur les notes et avis'
    case 'budget':
      return 'Les meilleurs logements à petit budget'
    case 'top-rated':
      return 'Les mieux notés par les voyageurs'
    case 'superhost':
      return 'Logements de superhôtes certifiés'
    case 'balanced':
      return 'Le meilleur compromis note, avis et prix'
    case 'personalized':
    default:
      return 'Sélectionnés spécialement pour vous'
  }
})
</script>

