<template>
  <div v-if="similarAccommodations.length > 0" class="mt-12">
    <h2 class="text-2xl font-bold text-gray-900 mb-6">Logements similaires</h2>
    <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      <AccommodationCard
        v-for="accommodation in similarAccommodations"
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
import { findSimilarAccommodations } from '@/utils/accommodationSimilarity'

interface Props {
  currentAccommodation: Accommodation
  allAccommodations: Accommodation[]
  maxResults?: number
}

const props = withDefaults(defineProps<Props>(), {
  maxResults: 6
})

const emit = defineEmits<{
  'accommodation-selected': [id: string]
}>()

const similarAccommodations = computed(() => {
  return findSimilarAccommodations(
    props.currentAccommodation,
    props.allAccommodations,
    props.maxResults
  )
})
</script>

