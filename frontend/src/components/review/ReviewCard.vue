<template>
  <div class="bg-white rounded-xl border border-gray-200 p-4 sm:p-6 hover:shadow-md transition-shadow">
    <!-- Author Info -->
    <div class="flex items-start gap-3 sm:gap-4 mb-4">
      <div class="w-10 h-10 sm:w-12 sm:h-12 rounded-full bg-african-green flex items-center justify-center text-white font-semibold flex-shrink-0">
        <img
          v-if="review.author.profilePhoto"
          :src="review.author.profilePhoto"
          :alt="`${review.author.firstName} ${review.author.lastName}`"
          class="w-full h-full rounded-full object-cover"
        />
        <span v-else class="text-sm sm:text-base">
          {{ review.author.firstName[0] }}{{ review.author.lastName[0] }}
        </span>
      </div>
      
      <div class="flex-1 min-w-0">
        <div class="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-1 sm:gap-2">
          <div class="min-w-0">
            <h4 class="font-semibold text-gray-900 text-sm sm:text-base truncate">
              {{ review.author.firstName }} {{ review.author.lastName }}
            </h4>
            <p class="text-xs sm:text-sm text-gray-500">{{ formatDate(review.publishedAt) }}</p>
          </div>
          <div class="flex-shrink-0">
            <StarRating :model-value="review.rating" readonly size="sm" />
          </div>
        </div>
      </div>
    </div>

    <!-- Comment -->
    <div v-if="review.comment" class="mb-4">
      <p class="text-sm sm:text-base text-gray-700 leading-relaxed whitespace-pre-wrap">{{ review.comment }}</p>
    </div>

    <!-- Detailed Ratings -->
    <div v-if="hasDetailedRatings" class="grid grid-cols-1 sm:grid-cols-2 gap-2 sm:gap-3 mb-4 p-3 sm:p-4 bg-gray-50 rounded-lg">
      <div v-if="review.detailedRatings?.cleanliness" class="flex items-center justify-between gap-2">
        <span class="text-xs sm:text-sm text-gray-600 truncate">Propreté</span>
        <StarRating :model-value="review.detailedRatings.cleanliness" readonly size="sm" />
      </div>
      
      <div v-if="review.detailedRatings?.communication" class="flex items-center justify-between gap-2">
        <span class="text-xs sm:text-sm text-gray-600 truncate">Communication</span>
        <StarRating :model-value="review.detailedRatings.communication" readonly size="sm" />
      </div>
      
      <div v-if="review.detailedRatings?.location" class="flex items-center justify-between gap-2">
        <span class="text-xs sm:text-sm text-gray-600 truncate">Emplacement</span>
        <StarRating :model-value="review.detailedRatings.location" readonly size="sm" />
      </div>
      
      <div v-if="review.detailedRatings?.value" class="flex items-center justify-between gap-2">
        <span class="text-xs sm:text-sm text-gray-600 truncate">Qualité/Prix</span>
        <StarRating :model-value="review.detailedRatings.value" readonly size="sm" />
      </div>
    </div>

    <!-- Stay Info (if available) -->
    <div v-if="review.reservation && showStayInfo" class="text-sm text-gray-500 border-t pt-3">
      Séjour du {{ formatDate(review.reservation.startDate) }} au {{ formatDate(review.reservation.endDate) }}
    </div>

    <!-- Owner Response (if available) -->
    <div v-if="review.ownerResponse" class="mt-4 pl-4 border-l-2 border-african-green">
      <div class="flex items-center gap-2 mb-2">
        <MessageSquare class="w-4 h-4 text-african-green" />
        <span class="text-sm font-semibold text-gray-900">Réponse du propriétaire</span>
        <span v-if="review.responseDate" class="text-xs text-gray-500">
          {{ formatDate(review.responseDate) }}
        </span>
      </div>
      <p class="text-sm text-gray-700">{{ review.ownerResponse }}</p>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { MessageSquare } from 'lucide-vue-next'
import StarRating from './StarRating.vue'
import type { Review } from '@/services/reviewService'

interface Props {
  review: Review
  showStayInfo?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  showStayInfo: false,
})

const hasDetailedRatings = computed(() => {
  if (!props.review.detailedRatings) return false
  return Object.values(props.review.detailedRatings).some(rating => rating && rating > 0)
})

function formatDate(dateString: string): string {
  const date = new Date(dateString)
  return new Intl.DateTimeFormat('fr-FR', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  }).format(date)
}
</script>
